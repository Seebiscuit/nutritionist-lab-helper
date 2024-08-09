import { NextRequest, NextResponse } from 'next/server';
import { patientRepository } from '@/db/repositories/patient-repository';
import { withErrorHandling } from '@/util/backend/api-error-handler';

export const GET = withErrorHandling(async (_req: NextRequest, { params }: { params: { id: string; }; }) => {
    const patient = await patientRepository.getPatientById(Number(params.id));
    if (patient) {
        return NextResponse.json(patient);
    } else {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
});

export const PUT = withErrorHandling(async (req: NextRequest, { params }: { params: { id: string; }; }) => {
    const { name } = await req.json();
    const patient = await patientRepository.updatePatient(Number(params.id), name);
    return NextResponse.json(patient);
});

export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: { params: { id: string; }; }) => {
    const patient = await patientRepository.deletePatient(Number(params.id));
    return NextResponse.json(patient);
});