import { useQuery } from '@tanstack/react-query';
import { apiBuilder } from '@/util/frontend/api-builder';
import { PATIENTS_ROUTE, PATIENTS_QUERY_KEY } from '@/app/api/constants';

// Define types based on Prisma schema
interface Patient {
    id: number;
    name: string;
}

// Get all patients
export const useFetchPatients = () => {
    return useQuery<Patient[], Error>({
        queryKey: [PATIENTS_QUERY_KEY],
        queryFn: () => apiBuilder(PATIENTS_ROUTE).send<Patient[]>(),
    });
};

// Get patient by ID
export const useFetchPatient = (id: number) => {
    return useQuery<Patient, Error>({
        queryKey: [PATIENTS_QUERY_KEY, id],
        queryFn: () => apiBuilder(`${PATIENTS_ROUTE}/${id}`).send<Patient>(),
    });
};