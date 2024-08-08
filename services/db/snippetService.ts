import { PrismaClient, Snippet } from '@prisma/client';
import { fuzzySearch } from '../../util/fuzzySearch';

const prisma = new PrismaClient();

export const snippetService = {
    async getAllSnippets(): Promise<Snippet[]> {
        return prisma.snippet.findMany({
            orderBy: { key: 'asc' },
        });
    },

    async createSnippet(key: string, content: string): Promise<Snippet> {
        return prisma.snippet.create({
            data: { key, content },
        });
    },

    async updateSnippet(id: number, key: string, content: string): Promise<Snippet> {
        return prisma.snippet.update({
            where: { id },
            data: { key, content },
        });
    },

    async deleteSnippet(id: number): Promise<Snippet> {
        return prisma.snippet.delete({
            where: { id },
        });
    },

    async searchSnippets(query: string): Promise<Snippet[]> {
        const allSnippets = await this.getAllSnippets();
        return fuzzySearch(allSnippets, query, ['key', 'content']);
    },

    getComputedSnippet(key: string): string | null {
        switch (key.toLowerCase()) {
            case '[date]':
                return new Date().toLocaleDateString();
            case '[time]':
                return new Date().toLocaleTimeString();
            default:
                return null;
        }
    },
};