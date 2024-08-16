import React, { useState } from "react";
import { useFetchAllPatients } from "@/services/http/usePatients";
import {
    useGetPatientGroups,
    useCreatePatientGroup,
    useDeletePatientGroup,
    PatientGroup,
} from "@/services/http/useGroups";
import { useSelectedPatients } from "../stores/selectedPatientsStore";

interface PatientListProps {
}

const PatientList: React.FC<PatientListProps> = () => {
    const [newGroupName, setNewGroupName] = useState("");
    const [showGroupForm, setShowGroupForm] = useState(false);
    const { selectedPatients, togglePatient, clearSelection } = useSelectedPatients();

    const { data: patients, isLoading: patientsLoading, error: patientsError } = useFetchAllPatients();
    const { data: groups, isLoading: groupsLoading, error: groupsError } = useGetPatientGroups();
    const createGroupMutation = useCreatePatientGroup();
    const deleteGroupMutation = useDeletePatientGroup();

    if (patientsLoading || groupsLoading) return <div>Loading...</div>;
    if (patientsError || groupsError) return <div>Error loading data</div>;

    const handleCreateGroup = async () => {
        if (newGroupName && selectedPatients.length > 0) {
            await createGroupMutation.mutateAsync({ name: newGroupName, patientIds: selectedPatients });
            setNewGroupName("");
            setShowGroupForm(false);
            clearSelection();
        }
    };

    const handleDeleteGroup = async (groupId: number) => {
        await deleteGroupMutation.mutateAsync(groupId);
    };

    const handleSelectGroup = (group: PatientGroup) => {
        clearSelection();
        group.members.forEach((member) => togglePatient(member.patientId));
    };

    return (
        <div className="w-64 p-4 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Patients</h2>
            <div className="mb-4">
                <button
                    className="bg-purple-500 text-white px-4 py-2 rounded mr-2"
                    onClick={() => setShowGroupForm(!showGroupForm)}
                >
                    Create Group
                </button>
            </div>
            {showGroupForm && (
                <div className="mb-4">
                    <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="New group name"
                    />
                    <button
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded w-full"
                        onClick={handleCreateGroup}
                    >
                        Save Group
                    </button>
                </div>
            )}
            <div className="mb-4">
                <h3 className="font-bold mb-2">Groups</h3>
                {groups?.map((group) => (
                    <div key={group.id} className="flex justify-between items-center mb-2">
                        <button className="text-left" onClick={() => handleSelectGroup(group)}>
                            {group.name}
                        </button>
                        <button className="text-red-500" onClick={() => handleDeleteGroup(group.id)}>
                            X
                        </button>
                    </div>
                ))}
            </div>
            <div>
                <h3 className="font-bold mb-2">
                    Patients
                    {patients && (
                        <span className="text-sm ml-2">
                            ({patients.length}
                            {selectedPatients && `/${selectedPatients.length} selected`})
                        </span>
                    )}
                </h3>
                {patients?.map((patient) => (
                    <div key={patient.id} className="flex items-center mb-2">
                        <input
                            id={`patient-${patient.id}`}
                            type="checkbox"
                            checked={selectedPatients.includes(patient.id)}
                            onChange={() => togglePatient(patient.id)}
                            className="mr-2"
                        />
                        <label
                            htmlFor={`patient-${patient.id}`}
                            className="cursor-pointer"
                        >
                            {patient.name}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientList;
