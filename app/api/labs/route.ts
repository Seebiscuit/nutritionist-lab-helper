import { NextRequest, NextResponse } from 'next/server';
import { labRepository } from '@/db/repositories/lab-repository';  // Adjust the import path as needed

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const csvContent = body.csvContent;
        await labRepository.processLabsCsv(csvContent);
        return NextResponse.json({ message: 'Lab data uploaded successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: `Error uploading lab data: ${(<Error>error).message}` }, { status: 500 });
    }
}