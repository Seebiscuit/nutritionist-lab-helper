import { PrismaClient, Patient } from '@prisma/client';

const prisma = new PrismaClient();

export const patientService = {
    async getAllPatients(): Promise<Patient[]> {
        return prisma.patient.findMany({
            orderBy: { name: 'asc' },
        });
    },

    async getPatientById(id: number): Promise<Patient | null> {
        return prisma.patient.findUnique({
            where: { id },
        });
    },

    async createPatient(name: string): Promise<Patient> {
        return prisma.patient.create({
            data: { name },
        });
    },

    async updatePatient(id: number, name: string): Promise<Patient> {
        return prisma.patient.update({
            where: { id },
            data: { name },
        });
    },

    async deletePatient(id: number): Promise<Patient> {
        return prisma.patient.delete({
            where: { id },
        });
    },

    async getOrCreatePatient(name: string): Promise<Patient> {
        const existingPatient = await prisma.patient.findFirst({
            where: { name },
        });

        if (existingPatient) {
            return existingPatient;
        }

        return this.createPatient(name);
    },
};