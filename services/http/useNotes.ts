import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiBuilder } from '@/util/frontend/api-builder';
import { NOTES_QUERY_KEY, NOTES_ROUTE } from '@/app/api/constants';

interface Note {
    id: number;
    patientId: number;
    date: string;
    content: string;
}

export const useNotes = (patientId: number) => {
    const queryClient = useQueryClient();

    const fetchNotes = async () => {
        try {
            const notes = await apiBuilder(NOTES_ROUTE)
                .method('GET')
                .addQueryParams({ patientId })
                .send<Note[]>();
            return notes;
        } catch (error) {
            console.error("Error fetching notes:", error);
            throw error;
        }
    };

    const createNote = async (content: string) => {
        try {
            const newNote = await apiBuilder(NOTES_ROUTE)
                .method('POST')
                .body({ patientId, content })
                .send<Note>();
            return newNote;
        } catch (error) {
            console.error("Error creating note:", error);
            throw error;
        }
    };

    const updateNote = async ({ id, content }: { id: number; content: string; }) => {
        try {
            const updatedNote = await apiBuilder(NOTES_ROUTE)
                .method('PUT')
                .body({ id, content })
                .send<Note>();
            return updatedNote;
        } catch (error) {
            console.error("Error updating note:", error);
            throw error;
        }
    };


    const notesQuery = useQuery<Note[], Error>({
        queryKey: [NOTES_QUERY_KEY, patientId],
        queryFn: fetchNotes,
    });

    const createNoteMutation = useMutation({
        mutationFn: createNote,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, patientId] });
        },
        onError: (error) => {
            console.error("Create note mutation failed:", error);
        },
    });

    const updateNoteMutation = useMutation({
        mutationFn: updateNote,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY, patientId] });
        },
        onError: (error) => {
            console.error("Update note mutation failed:", error);
        },
    });

    return {
        notes: notesQuery.data ?? [],
        isLoading: notesQuery.isLoading,
        isError: notesQuery.isError,
        error: notesQuery.error,
        createNote: createNoteMutation.mutate,
        updateNote: updateNoteMutation.mutate,
    };
};