import { apiBuilder } from '@/util/frontend/api-builder';
import { LAB_UPLOAD_ROUTE } from '@/app/api/constants';

export const useLabUpload = () => {
    return (csvContent: string) =>
        apiBuilder(LAB_UPLOAD_ROUTE)
            .method('POST')
            .body({ csvContent })
            .send<{ message: string; }>();
};