import React, { useState } from "react";
import Layout from "../../components/Layout";
import PatientList from "../../components/PatientList";
import PatientFilterBar from "../../components/PatientFilterBar";
import LabTable from "../../components/LabTable";
import NotesComponent from "../../components/NotesComponent";
import { SelectedPatientsProvider } from "../../stores/selectedPatientsStore";

const LabsPage: React.FC = () => {
    const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
    const [showNotes, setShowNotes] = useState(false);

    return (
        <Layout>
            <SelectedPatientsProvider>
                <div className="flex">
                    <PatientList onPatientSelect={setSelectedPatientId} />
                    <div className="flex-grow p-4">
                        <PatientFilterBar />
                        <div className="mb-4">
                            <button
                                onClick={() => setShowNotes(!showNotes)}
                                className="bg-blue-500 text-white px-4 py-2 rounded"
                            >
                                {showNotes ? "Hide Notes" : "Show Notes"}
                            </button>
                        </div>
                        <div className="flex">
                            <div className={`flex-grow ${showNotes ? "w-1/2" : "w-full"}`}>
                                <LabTable />
                            </div>
                            {showNotes && selectedPatientId && (
                                <div className="w-1/2 ml-4">
                                    <NotesComponent patientId={selectedPatientId} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SelectedPatientsProvider>
        </Layout>
    );
};

export default LabsPage;
