import { NextRequest, NextResponse } from 'next/server';
import { patientRepository } from '@/db/repositories/patient-repository';
import { withErrorHandling } from '@/util/backend/api-error-handler';

export const GET = withErrorHandling(async () => {
    const patients = await patientRepository.getAllPatients();
    return NextResponse.json(patients);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
    const { name } = await req.json();
    const patient = await patientRepository.createPatient(name);
    return NextResponse.json(patient, { status: 201 });
});