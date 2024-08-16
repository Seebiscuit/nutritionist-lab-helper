"use client"
import React, { useState } from "react";
import PatientList from "../components/PatientList";
import LabTable from "../components/LabTable";
import NotesComponent from "../components/NotesComponent";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SelectedPatientsProvider } from "@/stores/selectedPatientsStore";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

const LabsPage: React.FC = () => {
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

    return (
        <QueryClientProvider client={queryClient}>
            <SelectedPatientsProvider>
                <div className="flex">
                    <div className="content-height sidebar-width h-screen overflow-x-hidden overflow-y-auto">
                        <PatientList />
                    </div>
                    <div className="content-height content-width flex-grow py-4 pl-3">
                        <div className="flex flex-col">
                            <div
                                className={`${
                                    selectedPatientId ? "content-max-height-half" : "content-height"
                                }  overflow-auto`}
                            >
                                <LabTable onClickPatient={(patientId: number) => setSelectedPatientId(patientId)} />
                            </div>
                            {selectedPatientId && (
                                <div className="content-height-half mt-4 pr-3 mb-3 overflow-auto">
                                    <NotesComponent patientId={selectedPatientId} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SelectedPatientsProvider>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};

export default LabsPage;
