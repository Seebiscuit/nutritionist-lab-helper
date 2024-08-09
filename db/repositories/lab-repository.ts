import { PrismaClient, Lab, Prisma } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface LabResult {
    column: string;
    value: string;
    annotations: string;
}

type LabResultJson = Prisma.JsonArray & LabResult[]

export const labService = {
    async getLabsForPatient(patientId: number): Promise<Lab[]> {
        return prisma.lab.findMany({
            where: { userId: patientId },
            orderBy: { collectedDate: 'desc' },
        });
    },

    async createLab(patientId: number, collectedDate: Date, results: LabResultJson): Promise<Lab> {
        return prisma.lab.create({
            data: {
                userId: patientId,
                collectedDate,
                results,
            },
        });
    },

    async processLabsCsv(csvContent: string): Promise<void> {
        const records = parse(csvContent, { columns: true });

        for (const record of records) {
            const patientName = record.SortNameField0;
            const collectedDate = new Date(record.CollDateField1);

            const patient = await prisma.patient.findFirst({ where: { name: patientName } });
            if (!patient) {
                console.error(`Patient not found: ${patientName}`);
                continue;
            }

            const results: LabResultJson = [];
            const labFields = [
                'ALB', 'NPNAH', 'K', 'CA', 'ADJCA', 'PHOS', 'ADJCP', 'PTHI', 'PTHIN',
                'HGB', 'FERR', 'SAT', 'KTV', 'GLU', 'VD25A', 'NA', 'POWT'
            ];

            for (const field of labFields) {
                const value = record[`${field}Field${labFields.indexOf(field) + 2}`];
                if (value) {
                    results.push({
                        column: field,
                        value: value,
                        annotations: '',
                    });
                }
            }

            await this.createLab(patient.id, collectedDate, results);
        }
    },
};