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

function getLatestBackup(dir) {
    const files = fs.readdirSync(dir)
        .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
        .map(file => ({ name: file, time: fs.statSync(path.join(dir, file)).mtime.getTime() }))
        .sort((a, b) => b.time - a.time);

    return files.length > 0 ? path.join(dir, files[0].name) : null;
}

const backupDir = path.join(PROJECT_ROOT, 'backups');
let backupFile = process.argv[2];

if (!backupFile) {
    backupFile = getLatestBackup(backupDir);
    if (!backupFile) {
        console.error('No backup file found in the backup directory');
        process.exit(1);
    }
    console.log(`Using latest backup: ${backupFile}`);
} else if (!fs.existsSync(backupFile)) {
    console.error('Specified backup file does not exist');
    process.exit(1);
}

const client = new Client({
    host: POSTGRES_HOST,
    database: POSTGRES_DATABASE,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
});

async function restore() {
    try {
        await client.connect();
        console.log('Connected to database. Starting restore...');

            const sql = fs.readFileSync(backupFile, 'utf-8');
            const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

            for (let statement of statements) {
                await client.query(statement);
            }

            console.log('Restore completed successfully.');
        } catch (error) {
            console.error('Error during restore:', error);
        } finally {
            await client.end();
        }
    }

    restore();