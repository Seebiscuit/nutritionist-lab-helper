// db/scripts/backup.js
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.development.local') });

const {
    POSTGRES_DATABASE,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_USER,
    PROJECT_ROOT,
} = process.env;

if (!PROJECT_ROOT) {
    console.error('PROJECT_ROOT environment variable is not set');
    process.exit(1);
}

const normalizedProjectRoot = path.normalize(PROJECT_ROOT);
const backupDir = path.join(normalizedProjectRoot, 'backups');

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputFile = path.join(backupDir, `backup-${timestamp}.sql`);

const client = new Client({
    host: POSTGRES_HOST,
    database: POSTGRES_DATABASE,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

async function getActualTableNames() {
    const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
  `);
    return res.rows.map(row => row.table_name);
}

async function getTableSchema(tableName, foreignKeys) {
    const res = await client.query(`
    SELECT 
      'CREATE TABLE IF NOT EXISTS "' || c.relname || '" (' ||
      string_agg(
        '"' || a.attname || '" ' ||  pg_catalog.format_type(a.atttypid, a.atttypmod) ||
        CASE 
          WHEN a.attnotnull THEN ' NOT NULL' 
          ELSE '' 
        END ||
        CASE
          WHEN a.atthasdef THEN ' DEFAULT ' || pg_get_expr(d.adbin, d.adrelid)
          ELSE ''
        END,
        ', '
      ) || 
      CASE 
        WHEN $2::text[] IS NOT NULL 
        THEN ', ' || array_to_string($2::text[], ', ')
        ELSE ''
      END
      || ');'
    as create_statement
    FROM pg_class c
    JOIN pg_attribute a ON a.attrelid = c.oid
    LEFT JOIN pg_attrdef d ON (a.attrelid, a.attnum) = (d.adrelid, d.adnum)
    WHERE c.relname = $1
      AND a.attnum > 0 
      AND NOT a.attisdropped
    GROUP BY c.relname;
  `, [tableName, foreignKeys]);

    return res.rows[0]?.create_statement;
}

function parsePrismaSchema() {
    const schemaPath = path.join(normalizedProjectRoot, 'db', 'schema.prisma');

    if (!fs.existsSync(schemaPath)) {
        throw new Error('Schema file not found at ' + schemaPath);
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    const modelRegex = /model\s+(\w+)\s*{([\s\S]*?)}/g;
    const fieldRegex = /(\w+)\s+(\w+)(\s*@id)?/;
    const relationRegex = /(\w+)\s+(\w+)(\[\])?\s*@relation\(fields:\s*\[(\w+)\],\s*references:\s*\[(\w+)\]\)/;
    const mapRegex = /@@map\("(\w+)"\)/;

    const models = [];
    let match;

    while ((match = modelRegex.exec(schemaContent)) !== null) {
        const modelName = match[1];
        const modelContent = match[2];
        let primaryKey = null;
        let dbName = modelName;
        const fields = [];
        const relations = [];

        // Check for @@map
        const mapMatch = modelContent.match(mapRegex);
        if (mapMatch) {
            dbName = mapMatch[1];
        }

        // Find fields and primary key
        const lines = modelContent.split('\n');
        for (const line of lines) {
            const fieldMatch = line.match(fieldRegex);
            if (fieldMatch) {
                fields.push({ name: fieldMatch[1], type: fieldMatch[2] });
                if (fieldMatch[3]) { // This field has @id
                    primaryKey = fieldMatch[1];
                }
            }

            const relationMatch = line.match(relationRegex);
            if (relationMatch) {
                relations.push({
                    fieldName: relationMatch[1],
                    relatedModel: relationMatch[2],
                    isList: !!relationMatch[3],
                    fieldKey: relationMatch[4],
                    referencedKey: relationMatch[5]
                });
            }
        }

        models.push({ prismaName: modelName, dbName, primaryKey, fields, relations });
    }

    return models;
}

function generateForeignKeyConstraints(model, models) {
    return model.relations
        .filter(relation => !relation.isList)  // Only consider non-list relations
        .map(relation => {
            const relatedModel = models.find(m => m.prismaName === relation.relatedModel);
            if (!relatedModel) return null;

            return `FOREIGN KEY ("${relation.fieldKey}") REFERENCES "${relatedModel.dbName}" ("${relation.referencedKey}")`;
        })
        .filter(constraint => constraint !== null);
}

async function backup() {
    try {
        await client.connect();

        const prismaModels = parsePrismaSchema();
        const actualTableNames = await getActualTableNames();

        let fullBackup = '';

        // First pass: Create tables
        for (let model of prismaModels) {
            const actualTableName = actualTableNames.find(name => name.toLowerCase() === model.dbName.toLowerCase());

            if (!actualTableName) {
                console.warn(`Table ${model.dbName} (${model.prismaName}) not found in the database. Skipping.`);
                continue;
            }

            if (!model.primaryKey) {
                console.warn(`No primary key found for table ${actualTableName} in Prisma schema. Skipping data backup.`);
                continue;
            }

            const foreignKeyConstraints = generateForeignKeyConstraints(model, prismaModels);
            const createStatement = await getTableSchema(actualTableName, foreignKeyConstraints);
            if (!createStatement) {
                console.warn(`Failed to get schema for table ${actualTableName}. Skipping.`);
                continue;
            }
            fullBackup += createStatement + '\n\n';
        }

        // Second pass: Insert data
        for (let model of prismaModels) {
            const actualTableName = actualTableNames.find(name => name.toLowerCase() === model.dbName.toLowerCase());

            if (!actualTableName) continue;  // Skip if table doesn't exist (we've already warned about this)

            // Get insert statements
            const dataRes = await client.query(`SELECT * FROM "${actualTableName}"`);
            if (dataRes.rows.length > 0) {
                const columns = Object.keys(dataRes.rows[0]).map(col => `"${col}"`).join(', ');
                fullBackup += `INSERT INTO "${actualTableName}" (${columns}) VALUES\n`;

                const values = dataRes.rows.map(row =>
                    '(' + Object.values(row).map(val =>
                        val === null ? 'NULL' :
                            typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` :
                                typeof val === 'object' ? `'${JSON.stringify(val).replace(/'/g, "''")}'` :
                                    val
                    ).join(', ') + ')'
                ).join(',\n');

                fullBackup += values + `\nON CONFLICT ("${model.primaryKey}") DO NOTHING;\n\n`;
            }
        }

        fs.writeFileSync(outputFile, fullBackup);
        console.log(`Backup completed: ${outputFile}`);

    } catch (error) {
        console.error('Error during backup:', error);
    } finally {
        await client.end();
    }
}

backup();