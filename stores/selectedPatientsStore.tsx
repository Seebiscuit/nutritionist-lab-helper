import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface SelectedPatientsContextType {
    selectedPatients: number[];
    addPatient: (patientId: number) => void;
    removePatient: (patientId: number) => void;
    togglePatient: (patientId: number) => void;
    clearSelection: () => void;
    isSelected: (patientId: number) => boolean;
}

const SelectedPatientsContext = createContext<SelectedPatientsContextType | undefined>(undefined);

export const useSelectedPatients = () => {
    const context = useContext(SelectedPatientsContext);
    if (!context) {
        throw new Error("useSelectedPatients must be used within a SelectedPatientsProvider");
    }
    return context;
};

export const SelectedPatientsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedPatients, setSelectedPatients] = useState<number[]>([]);

    const addPatient = useCallback((patientId: number) => {
        setSelectedPatients((prev) => [...new Set([...prev, patientId])]);
    }, []);

    const removePatient = useCallback((patientId: number) => {
        setSelectedPatients((prev) => prev.filter((id) => id !== patientId));
    }, []);

    const togglePatient = useCallback((patientId: number) => {
        setSelectedPatients((prev) =>
            prev.includes(patientId) ? prev.filter((id) => id !== patientId) : [...prev, patientId]
        );
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedPatients([]);
    }, []);

    const isSelected = useCallback(
        (patientId: number) => {
            return selectedPatients.includes(patientId);
        },
        [selectedPatients]
    );

    const value = {
        selectedPatients,
        addPatient,
        removePatient,
        togglePatient,
        clearSelection,
        isSelected,
    };

    return <SelectedPatientsContext.Provider value={value}>{children}</SelectedPatientsContext.Provider>;
};
