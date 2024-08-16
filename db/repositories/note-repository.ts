import { PrismaClient, Note } from '@prisma/client';

const prisma = new PrismaClient();

export const noteRepository = {
    async getNotesForPatient(patientId: number): Promise<Note[]> {
        return prisma.note.findMany({
            where: { patientId: patientId },
            orderBy: { date: 'desc' },
        });
    },

    async createNote(patientId: number, content: string): Promise<Note> {
        return prisma.note.create({
            data: {
                patientId: patientId,
                date: new Date(),
                content,
            },
        });
    },

    async updateNote(id: number, content: string): Promise<Note> {
        return prisma.note.update({
            where: { id },
            data: { content },
        });
    },

    async deleteNote(id: number): Promise<Note> {
        return prisma.note.delete({
            where: { id },
        });
    },
};