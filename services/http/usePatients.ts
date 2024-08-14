import { useQuery } from '@tanstack/react-query';
import { apiBuilder } from '@/util/frontend/api-builder';
import { PATIENTS_ROUTE, PATIENTS_QUERY_KEY, PATIENTS_WITH_LABS_QUERY_KEY } from '@/app/api/constants';
import { Prisma } from '@prisma/client';

// Define types based on Prisma schema
interface Patient {
    id: number;
    name: string;
}

// Get all patients
export const useFetchAllPatients = () => {
    return useQuery<Patient[], Error>({
        queryKey: [PATIENTS_QUERY_KEY],
        queryFn: () => apiBuilder(PATIENTS_ROUTE).send(),
    });
};

export const useFetchPatients = (ids: number[]) => {
    return useQuery<Patient[], Error>({
        queryKey: [PATIENTS_QUERY_KEY, ids],
        queryFn: () => apiBuilder(PATIENTS_ROUTE)
            .method('GET')
            .addQueryParams({ ids })
            .send(),
        enabled: ids.length > 0,
    });
};

type PatientWithLabs = Prisma.PatientGetPayload<{
    include: { labs: true; };
}>;

// Get patients with labs
export const useFetchPatientsWithLabs = (ids: number[]) => {
    return useQuery<PatientWithLabs[], Error>({
        queryKey: [PATIENTS_WITH_LABS_QUERY_KEY, ids],
        queryFn: () => apiBuilder(PATIENTS_ROUTE)
            .method('GET')
            .addQueryParams({ ids, withLabs: true })
            .send(),
        enabled: ids.length > 0,
    });
};