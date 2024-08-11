import { noteRepository } from '../db/repositories/note-repository';

interface UndoState {
    patientId: number;
    content: string;
}

export class UndoService {
    private undoStack: UndoState[] = [];
    private redoStack: UndoState[] = [];
    private currentState: UndoState | null = null;
    private saveTimeout: NodeJS.Timeout | null = null;

    constructor(private patientId: number) { }

    public pushState(content: string) {
        if (this.currentState && this.currentState.content !== content) {
            this.undoStack.push(this.currentState);
            if (this.undoStack.length > 10) {
                this.undoStack.shift();
            }
            this.redoStack = [];
        }

        this.currentState = { patientId: this.patientId, content };

        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(() => {
            this.saveNote();
        }, 10000);
    }

    public undo(): string | null {
        if (this.undoStack.length === 0) return null;

        const prevState = this.undoStack.pop()!;
        if (this.currentState) {
            this.redoStack.push(this.currentState);
        }
        this.currentState = prevState;

        return prevState.content;
    }

    public redo(): string | null {
        if (this.redoStack.length === 0) return null;

        const nextState = this.redoStack.pop()!;
        if (this.currentState) {
            this.undoStack.push(this.currentState);
        }
        this.currentState = nextState;

        return nextState.content;
    }

    private async saveNote() {
        if (this.currentState) {
            await noteRepository.createNote(this.currentState.patientId, this.currentState.content);
        }
    }
}