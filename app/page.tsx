"use client"
import React, { useState } from "react";
import PatientList from "../components/PatientList";
import LabTable from "../components/LabTable";
import NotesComponent from "../components/NotesComponent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SelectedPatientsProvider } from "@/stores/selectedPatientsStore";

const queryClient = new QueryClient();

const LabsPage: React.FC = () => {
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [showNotes, setShowNotes] = useState(false);

    return (
        <QueryClientProvider client={queryClient}>
            <SelectedPatientsProvider>
                <div className="flex">
                    <div className="content-height sidebar-width h-screen overflow-y-auto">
                        <PatientList onPatientSelect={setSelectedPatientId} />
                    </div>
                    <div className="content-height content-width flex-grow py-4 pl-3 w-6/7 h-screen overflow-auto">
                        <div className="mb-4">
                            <button
                                onClick={() => setShowNotes(!showNotes)}
                                className="bg-purple-500 text-white px-4 py-2 rounded"
                            >
                                {showNotes ? "Hide Notes" : "Show Notes"}
                            </button>
                        </div>
                        <div className="flex">
                            <div className={`flex-grow ${showNotes ? "h-1/2" : "h-full"}`}>
                                <LabTable />
                            </div>
                            {showNotes && selectedPatientId && (
                                <div className="h-1/2 ml-4">
                                    <NotesComponent patientId={selectedPatientId} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SelectedPatientsProvider>
        </QueryClientProvider>
    );
};

export default LabsPage;
