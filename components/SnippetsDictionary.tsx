import React, { useState, KeyboardEvent } from "react";
import { useSnippets } from "@/services/http/useSnippets";

const SnippetsDictionary: React.FC = () => {
    const { snippets, isLoading, error, createSnippet, updateSnippet, deleteSnippet } = useSnippets();
    const [newSnippet, setNewSnippet] = useState({ key: "", content: "" });
    const [editingSnippet, setEditingSnippet] = useState<{ id: number; key: string; content: string } | null>(null);

    const handleCreateSnippet = async () => {
        if (newSnippet.key && newSnippet.content) {
            await createSnippet.mutateAsync(newSnippet);
            setNewSnippet({ key: "", content: "" });
        }
    };

    const handleUpdateSnippet = async () => {
        if (editingSnippet) {
            await updateSnippet.mutateAsync(editingSnippet);
            setEditingSnippet(null);
        }
    };

    const handleDeleteSnippet = async (id: number) => {
        await deleteSnippet.mutateAsync(id);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>, action: () => void) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            action();
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

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
                    placeholder="Snippet Content (Ctrl+Enter to save)"
                    value={newSnippet.content}
                    onChange={(e) => setNewSnippet({ ...newSnippet, content: e.target.value })}
                    onKeyDown={(e) => handleKeyDown(e, handleCreateSnippet)}
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
                                    onKeyDown={(e) => handleKeyDown(e, handleUpdateSnippet)}
                                    className="w-full p-2 mb-2 border rounded"
                                    rows={3}
                                    placeholder="Ctrl+Enter to save"
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
