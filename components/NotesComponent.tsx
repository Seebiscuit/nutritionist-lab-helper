import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNotes } from "@/services/http/useNotes";
import NotesTokenizer from "./NotesTokenizer";
import { UndoService } from "@/services/undoService";
import useElementArrayRefs from "@/util/frontend/hooks/useElementArrayRefs";
import { debounce } from "@/util/frontend/debounce";
import { useMount } from "@/util/frontend/hooks/useMount";
interface NotesComponentProps {
    patientId: number;
}

interface EditingNote {
    id: number;
    content: string;
    lastSelectionStart?: number;
}

const AUTO_SAVE_INTERVAL = 30000;

const NotesComponent: React.FC<NotesComponentProps> = ({ patientId }) => {
    const { notes, isLoading, createNote, updateNote } = useNotes(patientId);
    const [editingNote, setEditingNote] = useState<EditingNote | null>(null);

    const [newNoteContent, setNewNoteContent] = useState("");

    const notesLengthPlusNew = notes.length + 1;
    const [textareaEls, setTextareaEl] = useElementArrayRefs<HTMLTextAreaElement>(notesLengthPlusNew);

    //const undoServiceRef = useRef<UndoService>(new UndoService(patientId));
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (editingNote) {
            console.log("last note id", notes[0].id);
            console.log("editing note id", editingNote.id);

            const textareaEl = getTextArea(editingNote.id);
            if (textareaEl) {
                console.log("textareaEl", textareaEl);

                console.log("focus on id", editingNote.id);

                textareaEl.focus();
                textareaEl.selectionStart = editingNote.lastSelectionStart ?? 0;
                textareaEl.scrollIntoView();
            }
        }
    }, [notes, editingNote]);

    useMount(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);

                if (editingNote) {
                    handleSaveNote(editingNote.id, editingNote.content);
                }
            }
        };
    });

    const handleNoteChange = async (cursorPosition: number, content: string, noteId: number | null = null) => {
        if (noteId === null) {
            if (editingNote) {
                await handleSaveNote(editingNote.id, editingNote.content);
            }
            setNewNoteContent(content);
            noteId = await handleSaveNote(null, content);
        }

        setEditingNote({ id: noteId, content, lastSelectionStart: cursorPosition });
        //undoServiceRef.current.pushState(content);

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            handleSaveNote(noteId, content);
        }, AUTO_SAVE_INTERVAL); // Auto-save after 30 seconds
    };

    const debouncedHandleNoteChange = useCallback(debounce(handleNoteChange, 1000), [editingNote]);

    const handleEditNote = (note: EditingNote) => {
        setEditingNote(note);
        //undoServiceRef.current = new UndoService(patientId);
        //undoServiceRef.current.pushState(note.content);
    };

    const handleSaveNote = async (noteId: number | null = null, content: string): Promise<number> => {
        let currentNoteId = noteId ?? 0;
        if (noteId === null) {
            if (content.trim()) {
                const newNote = await createNote(content);
                currentNoteId = newNote.id;
                setNewNoteContent("");
            }
        } else {
            await updateNote({ id: noteId, content });
        }

        return currentNoteId;
    };

    const onClickNote = (note: EditingNote) => {
        if (editingNote && editingNote.id !== note.id) {
            handleSaveNote(editingNote.id, editingNote.content);

            note.lastSelectionStart ??= note.content.length;
            handleEditNote(note);
        }
    };
    const getTextArea = (noteId: number) => {
        const indexOfTextArea = sortedNotes.findIndex((note) => note.id === noteId);
        return textareaEls[indexOfTextArea];
    };

    /* const handleUndo = () => {
        const previousState = undoServiceRef.current.undo();
        if (previousState !== null) {
            if (editingNote) {
                setEditingNote({ ...editingNote, content: previousState });
            } else {
                setNewNoteContent(previousState);
            }
        }
    } */ /*     const handleRedo = () => {
        const nextState = undoServiceRef.current.redo();
        if (nextState !== null) {
            if (editingNote) {
                setEditingNote({ ...editingNote, content: nextState });
            } else {
                setNewNoteContent(nextState);
            }
        }
    }; */

    if (isLoading) {
        return <div>Loading notes...</div>;
    }

    const sortedNotes = [...notes].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className={`bg-gray-50 border rounded p-4`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Patient Notes</h2>
                <div>
                    {/* <button onClick={handleUndo} className="mr-2 p-1 bg-gray-200 rounded">
                        Undo
                    </button>
                    <button onClick={handleRedo} className="mr-2 p-1 bg-gray-200 rounded">
                        Redo
                    </button> */}
                </div>
            </div>
            <div>
                {sortedNotes.map((note, noteIndex) => (
                    <div key={note.id} className="mb-4 text-black ">
                        <div className="text-sm mb-2">{new Date(note.date).toLocaleString()}</div>
                        <textarea
                            value={editingNote && editingNote.id === note.id ? editingNote.content : note.content}
                            onClick={() => onClickNote(note)}
                            onChange={(e) => {
                                const el = e.target;
                                handleNoteChange(el.selectionStart, el.value, note.id);
                            }}
                            className="w-full p-0 border-none resize-none bg-transparent focus:outline-none"
                            style={{
                                minHeight: "1.5em",
                                height: "auto",
                                overflow: "hidden",
                            }}
                            onInput={(e) => {
                                e.currentTarget.style.height = "auto";
                                e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
                            }}
                            ref={setTextareaEl(noteIndex)}
                        />
                        <NotesTokenizer
                            onChange={(cursorPosition, content) => handleNoteChange(cursorPosition, content, note.id)}
                            textarea={textareaEls[noteIndex]}
                        />
                        <span>---</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 text-black">
                <textarea
                    value={newNoteContent}
                    onChange={(e) => {
                       const { value, selectionStart} = e.target;
                        setNewNoteContent(value);
                        debouncedHandleNoteChange(selectionStart, value);
                    }}
                    className="w-full p-0 border-none resize-none bg-transparent focus:outline-none"
                    style={{
                        minHeight: "1.5em",
                        height: "auto",
                        overflow: "hidden",
                    }}
                    onInput={(e) => {
                        e.currentTarget.style.height = "auto";
                        e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
                    }}
                    placeholder="Start typing your note here..."
                    ref={setTextareaEl(notesLengthPlusNew - 1)}
                />
            </div>
        </div>
    );
};

export default NotesComponent;
