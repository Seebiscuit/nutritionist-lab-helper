import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiBuilder } from '@/util/frontend/api-builder';
import { LAB_UPLOAD_ROUTE, PATIENTS_QUERY_KEY } from '@/app/api/constants';

export const useLabUpload = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (csvContent: string) =>
            apiBuilder(LAB_UPLOAD_ROUTE)
                .method('POST')
                .body({ csvContent })
                .send<{ message: string; }>(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [PATIENTS_QUERY_KEY] });
        },
        onError: (error) => {
            console.error('Error uploading lab data:', error);
            // You can add more logic here, like showing an error notification
        }
    });
};