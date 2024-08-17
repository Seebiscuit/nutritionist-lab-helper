import React, { useState, useEffect } from "react";
import { useSnippets } from "../services/http/useSnippets";
import { cursorPositioningService } from "../services/cursorPositioningService";

interface NotesTokenizerProps {
    onChange: (value: string) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const NotesTokenizer: React.FC<NotesTokenizerProps> = ({ onChange, textareaRef }) => {
    const [snippetQuery, setSnippetQuery] = useState("");
    const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { searchSnippets } = useSnippets();
    const { data: snippetResults = [], isLoading } = searchSnippets(snippetQuery);

    useEffect(() => {
        if (snippetQuery) {
            setShowResults(true);
            setSelectedIndex(0);
        } else {
            setShowResults(false);
        }
    }, [snippetQuery]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.addEventListener("input", handleInputChange);
            textarea.addEventListener("keydown", handleKeyDown);
            return () => {
                textarea.removeEventListener("input", handleInputChange);
                textarea.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [textareaRef, snippetResults]);

    const handleInputChange = () => {
        const textarea = textareaRef.current;
        if (textarea) {
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
        }
    };

    const insertSnippet = (snippet: string) => {
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
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (showResults) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((prevIndex) => (prevIndex + 1) % snippetResults.length);
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((prevIndex) => (prevIndex - 1 + snippetResults.length) % snippetResults.length);
            } else if (e.key === "Enter") {
                e.preventDefault();
                insertSnippet(snippetResults[selectedIndex].content);
            } else if (e.key === "Escape") {
                setShowResults(false);
            }
        }
    };

    return (
        <>
            {showResults && !isLoading && (
                <div
                    className="absolute bg-white border rounded shadow-lg z-10"
                    style={{ top: cursorPosition.top, left: cursorPosition.left }}
                >
                    {snippetResults.map((result, index) => (
                        <div
                            key={index}
                            className={`p-2 cursor-pointer ${index === selectedIndex ? "bg-blue-100" : ""}`}
                            onClick={() => insertSnippet(result.content)}
                        >
                            {result.key}: {result.content}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default NotesTokenizer;
