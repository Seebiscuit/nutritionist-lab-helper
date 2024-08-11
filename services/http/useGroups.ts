import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiBuilder } from '@/util/frontend/api-builder';
import { GROUPS_QUERY_KEY, GROUPS_ROUTE } from '@/app/api/constants';



// Fetch all groups
export const useGetPatientGroups = () => {
    return useQuery({
        queryKey: [GROUPS_QUERY_KEY],
        queryFn: () => apiBuilder(GROUPS_ROUTE).send()
    });
};

// Create a new group
export const useCreatePatientGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newGroup: { name: string; patientIds: number[]; }) =>
            apiBuilder(GROUPS_ROUTE)
                .method('POST')
                .body(newGroup)
                .send(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
        }
    });
};

// Update a group
export const useUpdatePatientGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (updatedGroup: { id: number; name: string; patientIds: number[]; }) =>
            apiBuilder(GROUPS_ROUTE)
                .method('PUT')
                .body(updatedGroup)
                .send(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
        }
    });
};

// Delete a group
export const useDeletePatientGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            apiBuilder(GROUPS_ROUTE)
                .method('DELETE')
                .body({ id })
                .send(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GROUPS_QUERY_KEY] });
        }
    });
};