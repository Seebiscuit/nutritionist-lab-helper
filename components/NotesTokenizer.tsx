import React, { useState, useEffect, useRef } from "react";
import { useSnippets } from "../services/http/useSnippets";
import { cursorPositioningService } from "../services/cursorPositioningService";

interface NotesTokenizerProps {
    onChange: (cursorPosition: number, value: string) => void;
    textarea: HTMLTextAreaElement | null;
}

const NotesTokenizer: React.FC<NotesTokenizerProps> = ({ onChange, textarea }) => {
    const [snippetQuery, setSnippetQuery] = useState("");
    const [cursorPosition, setCursorPosition] = useState({ top: 0, left: 0 });
    const [showResults, setShowResults] = useState(false);
    
    const { searchSnippets } = useSnippets();
    const { data: snippetResults = [], isLoading } = searchSnippets(snippetQuery);

    
    const [selectedIndex, setSelectedIndex] = useState(0);
    const selectedIndexRef = useRef(selectedIndex);
    
    useEffect(() => {
        selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    useEffect(() => {
        if (snippetQuery) {
            setShowResults(true);
            setSelectedIndex(0);
        } else {
            setShowResults(false);
        }
    }, [snippetQuery]);

    useEffect(() => {
        if (textarea) {
            textarea.addEventListener("input", handleInputChange);
            textarea.addEventListener("keydown", handleKeyDown);
            return () => {
                textarea.removeEventListener("input", handleInputChange);
                textarea.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [textarea, snippetResults]);

    const handleInputChange = () => {
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
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const textBeforeCursor = textarea.value.slice(0, start);
            const textAfterCursor = textarea.value.slice(end);
            const lastDoubleBraceIndex = textBeforeCursor.lastIndexOf("{{");
            const newValue = textBeforeCursor.slice(0, lastDoubleBraceIndex) + snippet + textAfterCursor;
            const newCursorPosition = lastDoubleBraceIndex + snippet.length;
            onChange(newCursorPosition, newValue);
        }
        setShowResults(false);
    };

     const handleKeyDown = (e: KeyboardEvent) => {
         if (showResults) {
             if (e.key === "ArrowDown") {
                 e.preventDefault();

                 setSelectedIndex((prevIndex) =>
                     prevIndex <= snippetResults.length - 1 ? prevIndex + 1 : snippetResults.length - 1
                 );
             } else if (e.key === "ArrowUp") {
                 e.preventDefault();

                 setSelectedIndex((prevIndex) => (prevIndex <= 0 ? 0 : prevIndex - 1));
             } else if (e.key === "Enter") {
                 e.preventDefault();

                 insertSnippet(snippetResults[selectedIndexRef.current].content);
             } else if (e.key === "Escape") {
                 setShowResults(false);
             }
         }
     };

    return (
        <>
            {showResults && !isLoading && (
                <div
                    className="absolute bg-white border rounded shadow-lg z-10 text-black"
                    style={{ top: cursorPosition.top, left: cursorPosition.left }}
                >
                    {snippetResults.map((result, index) => (
                        <div
                            key={index}
                            className={`p-2 cursor-pointer border-b-2 border-gray-300 hover:bg-purple-300 ${
                                index === selectedIndex ? "bg-purple-300" : "bg-gray-100"
                            }`}
                            onClick={() => insertSnippet(result.content)}
                        >
                            <span className="font-semibold">{result.key}</span>: {result.content}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default NotesTokenizer;
