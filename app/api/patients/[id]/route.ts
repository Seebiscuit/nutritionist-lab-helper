import { NextRequest, NextResponse } from 'next/server';
import { patientRepository } from '@/db/repositories/patient-repository';
import { withErrorHandling } from '@/util/backend/api-error-handler';

export const GET = withErrorHandling(async (req: NextRequest, { params }) => {
    const { id } = params;
    const withLabs = !!req.nextUrl.searchParams.get('withLabs');

    if (id) {
        // Fetch patient by ID
        const patientId = parseInt(id, 10);
        const patient = await patientRepository.getPatientById(patientId, withLabs);
        if (patient) {
            return NextResponse.json(patient);
        } else {
            return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
        }
    } else {
        return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }
});