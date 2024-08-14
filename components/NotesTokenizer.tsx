import React, { useState, useEffect, useRef } from "react";
import { snippetRepository } from "../db/repositories/snippet-repository";
import { cursorPositioningService } from "../services/cursorPositioningService";

interface NotesTokenizerProps {
    value: string;
    onChange: (value: string) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement>;
}

const NotesTokenizer: React.FC<NotesTokenizerProps> = ({ value, onChange, textareaRef }) => {
    const [snippetQuery, setSnippetQuery] = useState("");
    const [snippetResults, setSnippetResults] = useState<string[]>([]);
    const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
    const [showResults, setShowResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (snippetQuery) {
            searchSnippets();
        } else {
            setSnippetResults([]);
            setShowResults(false);
        }
    }, [snippetQuery]);

    const searchSnippets = async () => {
        const results = await snippetRepository.searchSnippets(snippetQuery);
        setSnippetResults(results.map((snippet) => snippet.content));
        setShowResults(true);
        setSelectedIndex(0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        onChange(newValue);

        const cursorIndex = e.target.selectionStart;
        const textBeforeCursor = newValue.slice(0, cursorIndex);
        const match = textBeforeCursor.match(/\{\{(\w*)$/);

        if (match) {
            setSnippetQuery(match[1]);
            const coords = cursorPositioningService.getCursorCoordinates(e.target);
            setCursorPosition(coords);
        } else {
            setSnippetQuery("");
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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    };

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="w-full h-full p-2 border rounded"
            />
            {showResults && (
                <div
                    className="absolute bg-white border rounded shadow-lg z-10"
                    style={{ top: cursorPosition.top, left: cursorPosition.left }}
                >
                    {snippetResults.map((result, index) => (
                        <div
                            key={index}
                            className={`p-2 cursor-pointer ${index === selectedIndex ? "bg-purple-100" : ""}`}
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
