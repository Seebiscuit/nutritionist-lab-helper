import { NextRequest, NextResponse } from 'next/server';
import { patientRepository } from '@/db/repositories/patient-repository';
import { withErrorHandling } from '@/util/backend/api-error-handler';

export const GET = withErrorHandling(async (req: NextRequest) => {
    const url = new URL(req.url);
    const ids = <string[]>url.searchParams.getAll('ids');
    const withLabs = !!url.searchParams.get('withLabs');

    if (ids.length) {
        // Fetch multiple patients by IDs
        const patientIds = ids.map(id => parseInt(id, 10));
        const patients = await patientRepository.getPatientsByIds(patientIds,withLabs);
        return NextResponse.json(patients);
    } else {
        // Fetch all patients
        const patients = await patientRepository.getAllPatients(withLabs);
        return NextResponse.json(patients);
    }
});

export const POST = withErrorHandling(async (req: NextRequest) => {
    const { name } = await req.json();
    const patient = await patientRepository.createPatient(name);
    return NextResponse.json(patient, { status: 201 });
});