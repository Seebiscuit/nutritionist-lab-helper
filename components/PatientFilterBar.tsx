import React, { useState, useEffect } from "react";
import { User } from "@prisma/client";
import { useSelectedPatients } from "../stores/selectedPatientsStore";
import { patientService } from "../services/db/patientService";

const PatientFilterBar: React.FC = () => {
    const { selectedPatients, removePatient } = useSelectedPatients();
    const [patients, setPatients] = useState<User[]>([]);
    const [showOverflow, setShowOverflow] = useState(false);

    useEffect(() => {
        const fetchSelectedPatients = async () => {
            const fetchedPatients = await Promise.all(selectedPatients.map((id) => patientService.getPatientById(id)));
            setPatients(fetchedPatients.filter((p): p is User => p !== null));
        };
        fetchSelectedPatients();
    }, [selectedPatients]);

    const visiblePatients = patients.slice(0, 5);
    const overflowPatients = patients.slice(5);

    return (
        <div className="flex items-center space-x-2 mb-4">
            {visiblePatients.map((patient) => (
                <div key={patient.id} className="bg-blue-100 px-2 py-1 rounded flex items-center">
                    <span>{patient.name}</span>
                    <button className="ml-2 text-red-500" onClick={() => removePatient(patient.id)}>
                        ×
                    </button>
                </div>
            ))}
            {overflowPatients.length > 0 && (
                <div className="relative">
                    <button className="bg-gray-200 px-2 py-1 rounded" onClick={() => setShowOverflow(!showOverflow)}>
                        +{overflowPatients.length} more
                    </button>
                    {showOverflow && (
                        <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg p-2">
                            {overflowPatients.map((patient) => (
                                <div key={patient.id} className="flex items-center justify-between mb-1">
                                    <span>{patient.name}</span>
                                    <button className="ml-2 text-red-500" onClick={() => removePatient(patient.id)}>
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientFilterBar;
