import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiBuilder } from '@/util/frontend/api-builder';
import { SNIPPETS_ROUTE, SNIPPETS_QUERY_KEY } from '@/app/api/constants';

interface Snippet {
    id: number;
    key: string;
    content: string;
}

export const useSnippets = () => {
    const queryClient = useQueryClient();

    const fetchSnippets = useQuery<Snippet[], Error>({
        queryKey: [SNIPPETS_QUERY_KEY],
        queryFn: () => apiBuilder(SNIPPETS_ROUTE).send(),
    });

    const searchSnippets = (query: string) => {
        return useQuery<Snippet[], Error>({
            queryKey: [SNIPPETS_QUERY_KEY, 'search', query],
            queryFn: () => apiBuilder(SNIPPETS_ROUTE)
                .method('GET')
                .addQueryParams({ query })
                .send(),
            enabled: !!query,
        });
    };

    const createSnippet = useMutation({
        mutationFn: (newSnippet: { key: string; content: string; }) =>
            apiBuilder(SNIPPETS_ROUTE).method('POST').body(newSnippet).send(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SNIPPETS_QUERY_KEY] });
        },
    });

    const updateSnippet = useMutation({
        mutationFn: (updatedSnippet: Snippet) =>
            apiBuilder(SNIPPETS_ROUTE).method('PUT').body(updatedSnippet).send(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SNIPPETS_QUERY_KEY] });
        },
    });

    const deleteSnippet = useMutation({
        mutationFn: (id: number) =>
            apiBuilder(SNIPPETS_ROUTE).method('DELETE').body({ id }).send(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SNIPPETS_QUERY_KEY] });
        },
    });

    return {
        snippets: fetchSnippets.data ?? [],
        isLoading: fetchSnippets.isLoading,
        error: fetchSnippets.error,
        searchSnippets,
        createSnippet,
        updateSnippet,
        deleteSnippet,
    };
};