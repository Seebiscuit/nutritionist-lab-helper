import { NextRequest, NextResponse } from 'next/server';
import { labService } from '@/db/repositories/labService';  // Adjust the import path as needed

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const csvContent = body.csvContent;
        await labService.processLabsCsv(csvContent);
        return NextResponse.json({ message: 'Lab data uploaded successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error uploading lab data' }, { status: 500 });
    }
}