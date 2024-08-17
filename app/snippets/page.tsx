"use client"

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SnippetsDictionary from "../../components/SnippetsDictionary";

const queryClient = new QueryClient();

const SnippetsDictionaryPage: React.FC = () => {
    return (
        <>
        <QueryClientProvider client={queryClient}>
                <SnippetsDictionary />
        </QueryClientProvider>
        </>
    );
};

export default SnippetsDictionaryPage;
