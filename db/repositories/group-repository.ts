import { PrismaClient, PatientGroup, PatientGroupMembership } from '@prisma/client';

const prisma = new PrismaClient();

export const groupService = {
    async getAllGroups(): Promise<PatientGroup[]> {
        return prisma.patientGroup.findMany({
            where: { deleted: false },
            include: { members: { include: { user: true } } },
        });
    },

    async createGroup(name: string, patientIds: number[]): Promise<PatientGroup> {
        return prisma.patientGroup.create({
            data: {
                name,
                members: {
                    create: patientIds.map(userId => ({ userId })),
                },
            },
            include: { members: { include: { user: true } } },
        });
    },

    async updateGroup(id: number, name: string, patientIds: number[]): Promise<PatientGroup> {
        await prisma.patientGroupMembership.deleteMany({
            where: { groupId: id },
        });

        return prisma.patientGroup.update({
            where: { id },
            data: {
                name,
                members: {
                    create: patientIds.map(userId => ({ userId })),
                },
            },
            include: { members: { include: { user: true } } },
        });
    },

    async deleteGroup(id: number): Promise<PatientGroup> {
        return prisma.patientGroup.update({
            where: { id },
            data: { deleted: true },
        });
    },

    async getGroupMembers(groupId: number): Promise<PatientGroupMembership[]> {
        return prisma.patientGroupMembership.findMany({
            where: { groupId },
            include: { user: true },
        });
    },
};