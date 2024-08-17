import { NextRequest, NextResponse } from 'next/server';
import { snippetRepository } from '@/db/repositories/snippet-repository';
import { withErrorHandling } from '@/util/backend/api-error-handler';

export const GET = withErrorHandling(async (req: NextRequest) => {
    const url = new URL(req.url);
    const query = url.searchParams.get('query');

    if (query) {
        // Search snippets
        const searchResults = await snippetRepository.searchSnippets(query);
        return NextResponse.json(searchResults);
    } else {
        // Get all snippets
        const snippets = await snippetRepository.getAllSnippets();
        return NextResponse.json(snippets);
    }
});

export const POST = withErrorHandling(async (req: NextRequest) => {
    const { key, content } = await req.json();
    const snippet = await snippetRepository.createSnippet(key, content);
    return NextResponse.json(snippet, { status: 201 });
});

export const PUT = withErrorHandling(async (req: NextRequest) => {
    const { id, key, content } = await req.json();
    const snippet = await snippetRepository.updateSnippet(id, key, content);
    return NextResponse.json(snippet);
});

export const DELETE = withErrorHandling(async (req: NextRequest) => {
    const { id } = await req.json();
    await snippetRepository.deleteSnippet(id);
    return NextResponse.json({ message: 'Snippet deleted successfully' });
});