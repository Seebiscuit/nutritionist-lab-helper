import React, { useState, useEffect, useCallback } from "react";
import { snippetRepository } from "@/db/repositories/snippet-repository";
import { cursorPositioningService } from "@/services/cursorPositioningService";

interface NotesTokenizerProps {
    onChange: (value: string) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const NotesTokenizer: React.FC<NotesTokenizerProps> = ({ textareaRef, onChange }) => {
    const [snippetQuery, setSnippetQuery] = useState("");
    const [snippetResults, setSnippetResults] = useState<string[]>([]);
    const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const searchSnippets = useCallback(async (query: string) => {
        const results =  query ? await snippetRepository.searchSnippets(query) : [];

        if (results?.length) {
            setSnippetResults(results.map((snippet) => snippet.content));
            setShowResults(true);
            setSelectedIndex(0);
        } else {
            setSnippetResults([]);
            setShowResults(false);
        }
    }, []);

    useEffect(() => {
        searchSnippets(snippetQuery);
    }, [snippetQuery, searchSnippets]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const handleInput = () => {
            const cursorIndex = textarea.selectionStart;
            const textBeforeCursor = textarea.value.slice(0, cursorIndex);
            const match = textBeforeCursor.match(/\{\{(\w*)$/);

            if (match) {
                setSnippetQuery(match[1]);
                const coords = cursorPositioningService.getCursorCoordinates(textarea);
                setCursorPosition(coords);
            } else {
                setSnippetQuery("");
            }

            onChange(textarea.value);
        };

        textarea.addEventListener("input", handleInput);
        return () => textarea.removeEventListener("input", handleInput);
    }, [textareaRef, onChange]);

    const insertSnippet = useCallback(
        (snippet: string) => {
            const textarea = textareaRef.current;
            if (textarea) {
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const textBeforeCursor = textarea.value.slice(0, start);
                const textAfterCursor = textarea.value.slice(end);
                const lastDoubleBraceIndex = textBeforeCursor.lastIndexOf("{{");
                const newValue = textBeforeCursor.slice(0, lastDoubleBraceIndex) + snippet + textAfterCursor;
                onChange(newValue);
                const newCursorPosition = lastDoubleBraceIndex + snippet.length;
                textarea.setSelectionRange(newCursorPosition, newCursorPosition);
                textarea.focus();
            }
            setShowResults(false);
        },
        [textareaRef, onChange]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (showResults) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSelectedIndex((prevIndex) => (prevIndex + 1) % snippetResults.length);
                } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSelectedIndex((prevIndex) => (prevIndex - 1 + snippetResults.length) % snippetResults.length);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    insertSnippet(snippetResults[selectedIndex]);
                } else if (e.key === "Escape") {
                    setShowResults(false);
                }
            }
        },
        [showResults, snippetResults, selectedIndex, insertSnippet]
    );

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.addEventListener("keydown", handleKeyDown as any);
            return () => textarea.removeEventListener("keydown", handleKeyDown as any);
        }
    }, [textareaRef, handleKeyDown]);

    return (
        <div className="relative">
            {showResults && (
                <div
                    className="absolute bg-white border rounded shadow-lg z-10"
                    style={{ top: cursorPosition.top, left: cursorPosition.left }}
                >
                    {snippetResults.map((result, index) => (
                        <div
                            key={index}
                            className={`p-2 cursor-pointer ${index === selectedIndex ? "bg-blue-100" : ""}`}
                            onClick={() => insertSnippet(result)}
                        >
                            {result}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotesTokenizer;
