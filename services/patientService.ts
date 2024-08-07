import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

export const patientService = {
    async getAllPatients(): Promise<User[]> {
        return prisma.user.findMany({
            orderBy: { name: 'asc' },
        });
    },

    async getPatientById(id: number): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    },

    async createPatient(name: string): Promise<User> {
        return prisma.user.create({
            data: { name },
        });
    },

    async updatePatient(id: number, name: string): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: { name },
        });
    },

    async deletePatient(id: number): Promise<User> {
        return prisma.user.delete({
            where: { id },
        });
    },

    async getOrCreatePatient(name: string): Promise<User> {
        const existingPatient = await prisma.user.findFirst({
            where: { name },
        });

        if (existingPatient) {
            return existingPatient;
        }

        return this.createPatient(name);
    },
};