import { PrismaClient, Lab, Prisma, Patient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { patientRepository } from './patient-repository';
import { BEGINNING_OF_EPOCH_TIME } from "@/app/api/constants";

interface LabRecord {
    patientId: number;
    collectedDate: string;
    results: LabResultJson;
}


const prisma = new PrismaClient();

interface LabResult {
    column: string;
    value: string;
    annotations: string;
}

type LabResultJson = Prisma.JsonArray & LabResult[]

export const labRepository = {
    async getLabsForPatient(patientId: number): Promise<Lab[]> {
        return prisma.lab.findMany({
            where: { patientId: patientId },
            orderBy: { collectedDate: 'desc' },
        });
    },

    async createLab(patientId: number, collectedDate: Date, results: LabResultJson): Promise<Lab> {
        return prisma.lab.create({
            data: {
                patientId: patientId,
                collectedDate,
                results,
            },
        });
    },

    async createLabs(labs: LabRecord[]): Promise<void> {
        await prisma.lab.createMany({ data: labs });
    },

    async processLabsCsv(csvContent: string): Promise<void> {
        const trimmedContent = csvContent?.trim();
        const records = parse(trimmedContent, { columns: true }) as LabCSVModel[];

        if (records?.length === 0) throw new Error('No records found in CSV');

        const namesOfNewPatients = await getPatientNamesFromLabs(records);
        const allPatients = await getOrCreateAllPatients(namesOfNewPatients);

        const batchRecords: LabRecord[] = generateBatchRecords(records, allPatients);

        await this.createLabs(batchRecords);
    },
};

function generateBatchRecords(records: LabCSVModel[], allPatients: { id: number; name: string; }[]): LabRecord[] {
    const batchRecords: LabRecord[] = [];
    for (const record of records) {
        const patientName = record.SortNameField0;
        const patient = allPatients.find((p) => p.name === patientName);

        if (!patient) {
            throw new Error(`Patient with name ${patientName} not found`);
        }

        const patientId = patient.id;
        const collectedDate = new Date(record.CollDateField1 || BEGINNING_OF_EPOCH_TIME).toISOString();

        const results: LabResultJson = [];
        const labFields = [
            'ALB', 'NPNAH', 'K', 'CA', 'ADJCA', 'PHOS', 'ADJCP', 'PTHI', 'PTHIN',
            'HGB', 'FERR', 'SAT', 'KTV', 'GLU', 'VD25A', 'NA', 'POWT'
        ];

        for (const field of labFields) {
            const value = record[`${field}Field${labFields.indexOf(field) + 2}` as unknown as keyof LabCSVModel];
            if (value) {
                results.push({
                    column: field,
                    value: value,
                    annotations: '',
                });
            }
        }
        batchRecords.push({ patientId, collectedDate, results });
    }
    return batchRecords;
}

async function getPatientNamesFromLabs(records: LabCSVModel[]) {
    return records.map((record) => record.SortNameField0);
}

async function getOrCreateAllPatients(patientNames: string[]): Promise<Patient[]> {
    const existingPatients = await patientRepository.getAllPatients();

    const dedupedPatientNames = dedupePatientNames(patientNames);
    const namesOfNewPatients = dedupedPatientNames
        .filter((name) => !existingPatients.some((p) => p.name === name));

    let newPatients: Patient[] = [];
    if (namesOfNewPatients.length > 0) {
        newPatients = await patientRepository.createPatients(namesOfNewPatients);
    }

    return [...existingPatients, ...newPatients];
}

function dedupePatientNames(patientNames:string[]):string[]{
    return [...new Set(patientNames)];
}