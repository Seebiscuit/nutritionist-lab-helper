import { NextRequest, NextResponse } from 'next/server';
import { groupService } from '@/db/repositories/group-repository';  // Adjust the import path as needed

type HandlerFunction = (req: NextRequest) => Promise<NextResponse>;

const withErrorHandling = (handler: HandlerFunction): HandlerFunction => {
    return async (req: NextRequest) => {
        try {
            return await handler(req);
        } catch (error) {
            console.error(error);
            return NextResponse.json(
                { error: 'An error occurred processing your request' },
                { status: 500 }
            );
        }
    };
};

export const GET = withErrorHandling(async () => {
    const groups = await groupService.getAllGroups();
    return NextResponse.json(groups);
});

export const POST = withErrorHandling(async (req) => {
    const { name, patientIds } = await req.json();
    if (!name || !Array.isArray(patientIds)) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const newGroup = await groupService.createGroup(name, patientIds);
    return NextResponse.json(newGroup, { status: 201 });
});

export const PUT = withErrorHandling(async (req) => {
    const { id, name, patientIds } = await req.json();
    if (!id || !name || !Array.isArray(patientIds)) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const updatedGroup = await groupService.updateGroup(id, name, patientIds);
    return NextResponse.json(updatedGroup);
});

export const DELETE = withErrorHandling(async (req) => {
    const { id } = await req.json();
    if (!id) {
        return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const deletedGroup = await groupService.deleteGroup(id);
    return NextResponse.json(deletedGroup);
});