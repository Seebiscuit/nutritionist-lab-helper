import React, { useState, useEffect, useRef } from "react";
import { useNotes } from "@/services/http/useNotes";
import NotesTokenizer from "./NotesTokenizer";
import { UndoService } from "@/services/undoService";

interface NotesComponentProps {
    patientId: number;
}

interface EditingNote {
    id: number;
    content: string;
}

const AUTO_SAVE_INTERVAL = 30000;

const NotesComponent: React.FC<NotesComponentProps> = ({ patientId }) => {
    const { notes, isLoading, createNote, updateNote } = useNotes(patientId);
    const [editingNote, setEditingNote] = useState<EditingNote | null>(null);
    const [newNoteContent, setNewNoteContent] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    //const undoServiceRef = useRef<UndoService>(new UndoService(patientId));
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, []);

    const handleNoteChange = (content: string, noteId: number | null = null) => {
        if (noteId === null) {
            setNewNoteContent(content);
        } else {
            setEditingNote((prev) => {
                if (prev && prev.id === noteId) {
                    return { ...prev, content };
                }

                return prev;
            });
        }
        //undoServiceRef.current.pushState(content);

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            handleSaveNote(noteId, content);
        }, AUTO_SAVE_INTERVAL); // Auto-save after 30 seconds
    };

    const handleEditNote = (note: EditingNote) => {
        setEditingNote(note);
        //undoServiceRef.current = new UndoService(patientId);
        //undoServiceRef.current.pushState(note.content);
    };

    const handleSaveNote = async (noteId: number | null = null, content: string) => {
        if (noteId === null) {
            if (newNoteContent.trim()) {
                await createNote(newNoteContent);
                setNewNoteContent("");
            }
        } else{
            await updateNote({ id: noteId, content });

            setEditingNote(null);
        }
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
                {sortedNotes.map((note) => (
                    <div key={note.id} className="mb-4 text-black ">
                        <div className="text-sm mb-2">{new Date(note.date).toLocaleString()}</div>
                        <textarea
                            value={editingNote && editingNote.id === note.id ? editingNote.content : note.content}
                            onChange={(e) => handleNoteChange(e.target.value, note.id)}
                            onClick={() => !editingNote && handleEditNote({ id: note.id, content: note.content })}
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
                            ref={textareaRef}
                        />
                        <NotesTokenizer
                            onChange={(content) => handleNoteChange(content, note.id)}
                            textareaRef={textareaRef}
                        />
                        <span>---</span>
                    </div>
                ))}
            </div>
            <div className="mt-4">
                <textarea
                    value={newNoteContent}
                    onChange={(e) => handleNoteChange(e.target.value)}
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
                />
                <NotesTokenizer onChange={(content) => handleNoteChange(content)} textareaRef={textareaRef} />
            </div>
        </div>
    );
};

export default NotesComponent;
