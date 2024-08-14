import { PrismaClient, Patient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

type PatientWithLabs = Prisma.PatientGetPayload<{
    include: { labs: true; };
}>;

export const patientRepository = {
    async getAllPatients(withLabs = false): Promise<Patient[] | PatientWithLabs[]> {
        return prisma.patient.findMany({
            orderBy: { name: 'asc' },
            ...getLabsInclude(withLabs),
        });
    },

    async getPatientById(id: number, withLabs = false): Promise<Patient | PatientWithLabs | null> {
        return prisma.patient.findUnique({
            where: { id },
            ...getLabsInclude(withLabs),
        });
    },

    async getPatientsByIds(ids: number[], withLabs = false): Promise<Patient[] | PatientWithLabs[] | null> {
        return prisma.patient.findMany({
            where: {
                id: {
                    in: ids
                }
            },
            ...getLabsInclude(withLabs),
            orderBy: { name: 'asc' },
        });
    },

    async createPatient(name: string): Promise<Patient> {
        return prisma.patient.create({
            data: { name },
        });
    },

    async createPatients(names: string[]): Promise<Patient[]> {
        return prisma.patient.createManyAndReturn({
            data: names.map((name) => ({ name })),
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

function getLabsInclude(withLabs: boolean) {
    return { include: { labs: withLabs } };

}