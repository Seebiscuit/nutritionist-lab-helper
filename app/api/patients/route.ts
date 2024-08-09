import { NextRequest, NextResponse } from 'next/server';
import { patientService } from '@/db/repositories/patientService';
import { withErrorHandling } from '@/util/backend/api-error-handler';

export const GET = withErrorHandling(async () => {
    const patients = await patientService.getAllPatients();
    return NextResponse.json(patients);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
    const { name } = await req.json();
    const patient = await patientService.createPatient(name);
    return NextResponse.json(patient, { status: 201 });
});