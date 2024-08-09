// utils/apiErrorHandler.ts
import { NextRequest, NextResponse } from 'next/server';

type AppRouteHandler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

export function withErrorHandling(handler: AppRouteHandler): AppRouteHandler {
    return async (req: NextRequest, ...args: any[]) => {
        try {
            return await handler(req, ...args);
        } catch (error) {
            console.error(error);
            return NextResponse.json(
                { error: 'An unexpected error occurred' },
                { status: 500 }
            );
        }
    };
}