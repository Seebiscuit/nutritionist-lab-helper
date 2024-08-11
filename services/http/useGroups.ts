import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiBuilder } from '@/util/frontend/api-builder';
import { GROUPS_QUERY_KEY, GROUPS_ROUTE } from '@/app/api/constants';

// Define types based on Prisma schema
export interface PatientGroup {
    id: number;
    name: string;
    members: { patientId: number; }[];
}

interface CreateGroupInput {
    name: string;
    patientIds: number[];
}

interface UpdateGroupInput extends CreateGroupInput {
    id: number;
}

// Fetch all groups
export const useGetPatientGroups = () => {
    return useQuery<PatientGroup[], Error>({
        queryKey: [GROUPS_QUERY_KEY],
        queryFn: () => apiBuilder(GROUPS_ROUTE).send<PatientGroup[]>()
    });
};

// Create a new group
export const useCreatePatientGroup = () => {
    const queryClient = useQueryClient();
    return useMutation<PatientGroup, Error, CreateGroupInput>({
        mutationFn: (newGroup: CreateGroupInput) =>
            apiBuilder(GROUPS_ROUTE)
                .method('POST')
                .body(newGroup)
                .send<PatientGroup>(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
        }
    });
};

// Update a group
export const useUpdatePatientGroup = () => {
    const queryClient = useQueryClient();
    return useMutation<PatientGroup, Error, UpdateGroupInput>({
        mutationFn: (updatedGroup: UpdateGroupInput) =>
            apiBuilder(GROUPS_ROUTE)
                .method('PUT')
                .body(updatedGroup)
                .send<PatientGroup>(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
        }
    });
};

// Delete a group
export const useDeletePatientGroup = () => {
    const queryClient = useQueryClient();
    return useMutation<PatientGroup, Error, number>({
        mutationFn: (id: number) =>
            apiBuilder(GROUPS_ROUTE)
                .method('DELETE')
                .body({ id })
                .send<PatientGroup>(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
        }
    });
};