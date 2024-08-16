import { NextRequest, NextResponse } from 'next/server';
import { noteRepository } from '@/db/repositories/note-repository';
import { withErrorHandling } from '@/util/backend/api-error-handler';

export const GET = withErrorHandling(async (req: NextRequest) => {
    const url = new URL(req.url);
    const patientId = url.searchParams.get('patientId');

    if (!patientId) {
        return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const notes = await noteRepository.getNotesForPatient(parseInt(patientId, 10));
    return NextResponse.json(notes);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
    const { patientId, content } = await req.json();

    if (!patientId || !content) {
        return NextResponse.json({ error: 'Patient ID and content are required' }, { status: 400 });
    }

    const note = await noteRepository.createNote(patientId, content);
    return NextResponse.json(note, { status: 201 });
});

export const PUT = withErrorHandling(async (req: NextRequest) => {
    const { id, content } = await req.json();

    if (!id || !content) {
        return NextResponse.json({ error: 'Note ID and content are required' }, { status: 400 });
    }

    const updatedNote = await noteRepository.updateNote(id, content);
    return NextResponse.json(updatedNote);
});