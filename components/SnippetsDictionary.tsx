"use client"

import React, { useState, useEffect } from "react";
import { Snippet } from "@prisma/client";
import { snippetService } from "../services/db/snippetService";

const SnippetsDictionary: React.FC = () => {
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [newSnippet, setNewSnippet] = useState({ key: "", content: "" });
    const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);

    useEffect(() => {
        fetchSnippets();
    }, []);

    const fetchSnippets = async () => {
        const fetchedSnippets = await snippetService.getAllSnippets();
        setSnippets(fetchedSnippets);
    };

    const handleCreateSnippet = async () => {
        if (newSnippet.key && newSnippet.content) {
            await snippetService.createSnippet(newSnippet.key, newSnippet.content);
            setNewSnippet({ key: "", content: "" });
            fetchSnippets();
        }
    };

    const handleUpdateSnippet = async () => {
        if (editingSnippet) {
            await snippetService.updateSnippet(editingSnippet.id, editingSnippet.key, editingSnippet.content);
            setEditingSnippet(null);
            fetchSnippets();
        }
    };

    const handleDeleteSnippet = async (id: number) => {
        await snippetService.deleteSnippet(id);
        fetchSnippets();
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Snippets Dictionary</h1>
            <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2">Create New Snippet</h2>
                <input
                    type="text"
                    placeholder="Snippet Key"
                    value={newSnippet.key}
                    onChange={(e) => setNewSnippet({ ...newSnippet, key: e.target.value })}
                    className="w-full p-2 mb-2 border rounded"
                />
                <textarea
                    placeholder="Snippet Content"
                    value={newSnippet.content}
                    onChange={(e) => setNewSnippet({ ...newSnippet, content: e.target.value })}
                    className="w-full p-2 mb-2 border rounded"
                    rows={3}
                />
                <button onClick={handleCreateSnippet} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Create Snippet
                </button>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Existing Snippets</h2>
                {snippets.map((snippet) => (
                    <div key={snippet.id} className="mb-4 p-4 border rounded">
                        {editingSnippet && editingSnippet.id === snippet.id ? (
                            <>
                                <input
                                    type="text"
                                    value={editingSnippet.key}
                                    onChange={(e) => setEditingSnippet({ ...editingSnippet, key: e.target.value })}
                                    className="w-full p-2 mb-2 border rounded"
                                />
                                <textarea
                                    value={editingSnippet.content}
                                    onChange={(e) => setEditingSnippet({ ...editingSnippet, content: e.target.value })}
                                    className="w-full p-2 mb-2 border rounded"
                                    rows={3}
                                />
                                <button
                                    onClick={handleUpdateSnippet}
                                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setEditingSnippet(null)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <h3 className="font-semibold">{snippet.key}</h3>
                                <p className="mb-2">{snippet.content}</p>
                                <button
                                    onClick={() => setEditingSnippet(snippet)}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteSnippet(snippet.id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SnippetsDictionary;
