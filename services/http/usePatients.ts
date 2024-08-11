import { useQuery } from '@tanstack/react-query';
import { apiBuilder } from '@/util/frontend/api-builder';

const PATIENTS_ENDPOINT = '/api/patients';

// Get all patients
export const useFetchPatients = () => {
    return useQuery({
        queryKey: ['patients'],
        queryFn: () => apiBuilder(PATIENTS_ENDPOINT).send(),
    });
};

// Get patient by ID
export const useFetchPatient = (id: number) => {
    return useQuery({
        queryKey: ['patient', id],
        queryFn: () => apiBuilder(`${PATIENTS_ENDPOINT}/${id}`).send(),
    });
};