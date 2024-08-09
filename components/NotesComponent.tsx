import React, { useState, useEffect, useRef } from "react";
import { Note } from "@prisma/client";
import { noteRepository } from "../db/repositories/note-repository";
import { UndoService } from "../services/undoService";
import NotesTokenizer from "./NotesTokenizer";

interface NotesComponentProps {
    patientId: number;
}

const NotesComponent: React.FC<NotesComponentProps> = ({ patientId }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNote, setCurrentNote] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const undoServiceRef = useRef<UndoService>(new UndoService(patientId));

    useEffect(() => {
        fetchNotes();
    }, [patientId]);

    const fetchNotes = async () => {
        const fetchedNotes = await noteRepository.getNotesForPatient(patientId);
        setNotes(fetchedNotes);
        setCurrentNote(fetchedNotes.map((note) => note.content).join("\n\n") + "\n\n");
    };

    const handleNoteChange = (content: string) => {
        setCurrentNote(content);
        undoServiceRef.current.pushState(content);
    };

    const handleUndo = () => {
        const previousState = undoServiceRef.current.undo();
        if (previousState !== null) {
            setCurrentNote(previousState);
        }
    };

    const handleRedo = () => {
        const nextState = undoServiceRef.current.redo();
        if (nextState !== null) {
            setCurrentNote(nextState);
        }
    };

    const handleSaveNote = async () => {
        await noteRepository.createNote(patientId, currentNote);
        fetchNotes();
    };

    return (
        <div className={`bg-white border rounded p-4 ${isExpanded ? "h-screen" : "h-64"}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Patient Notes</h2>
                <div>
                    <button onClick={handleUndo} className="mr-2 p-1 bg-gray-200 rounded">
                        Undo
                    </button>
                    <button onClick={handleRedo} className="mr-2 p-1 bg-gray-200 rounded">
                        Redo
                    </button>
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1 bg-blue-500 text-white rounded">
                        {isExpanded ? "Collapse" : "Expand"}
                    </button>
                </div>
            </div>
            <div className={`overflow-y-auto ${isExpanded ? "h-[calc(100%-8rem)]" : "h-40"}`}>
                <NotesTokenizer value={currentNote} onChange={handleNoteChange} textareaRef={textareaRef} />
            </div>
            <div className="mt-4">
                <button onClick={handleSaveNote} className="p-2 bg-green-500 text-white rounded">
                    Save Note
                </button>
            </div>
        </div>
    );
};

export default NotesComponent;
