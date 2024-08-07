import React, { useState, useEffect } from "react";
import { User, PatientGroup } from "@prisma/client";
import { patientService } from "../services/patientService";
import { groupService } from "../services/groupService";
import { useSelectedPatients } from "../stores/selectedPatientsStore";

interface PatientListProps {
    onPatientSelect: (patientId: number | null) => void;
}

const PatientList: React.FC<PatientListProps> = ({ onPatientSelect }) => {
    const [patients, setPatients] = useState<User[]>([]);
    const [groups, setGroups] = useState<PatientGroup[]>([]);
    const [newGroupName, setNewGroupName] = useState("");
    const [showGroupForm, setShowGroupForm] = useState(false);
    const { selectedPatients, togglePatient, clearSelection } = useSelectedPatients();

    useEffect(() => {
        fetchPatients();
        fetchGroups();
    }, []);

    const fetchPatients = async () => {
        const fetchedPatients = await patientService.getAllPatients();
        setPatients(fetchedPatients);
    };

    const fetchGroups = async () => {
        const fetchedGroups = await groupService.getAllGroups();
        setGroups(fetchedGroups);
    };

    const handleCreateGroup = async () => {
        if (newGroupName && selectedPatients.length > 0) {
            await groupService.createGroup(newGroupName, selectedPatients);
            setNewGroupName("");
            setShowGroupForm(false);
            clearSelection();
            fetchGroups();
        }
    };

    const handleDeleteGroup = async (groupId: number) => {
        await groupService.deleteGroup(groupId);
        fetchGroups();
    };

    const handleSelectGroup = async (groupId: number) => {
        clearSelection();
        const groupMembers = await groupService.getGroupMembers(groupId);
        
        if (!groupMembers?.length) return;
        
        const groupMemberIds = groupMembers.map((m) => m.userId);
        groupMemberIds.forEach(togglePatient);
    };

    return (
        <div className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Patients</h2>
            <div className="mb-4">
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    onClick={() => setShowGroupForm(!showGroupForm)}
                >
                    Create Group
                </button>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                        /* Implement delete functionality */
                    }}
                >
                    Delete
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
                {groups.map((group) => (
                    <div key={group.id} className="flex justify-between items-center mb-2">
                        <button
                            className="text-left"
                            onClick={() => handleSelectGroup(group.id)}
                        >
                            {group.name}
                        </button>
                        <button className="text-red-500" onClick={() => handleDeleteGroup(group.id)}>
                            X
                        </button>
                    </div>
                ))}
            </div>
            <div>
                <h3 className="font-bold mb-2">Patients</h3>
                {patients.map((patient) => (
                    <div key={patient.id} className="flex items-center mb-2">
                        <input
                            type="checkbox"
                            checked={selectedPatients.includes(patient.id)}
                            onChange={() => togglePatient(patient.id)}
                            className="mr-2"
                        />
                        <span onClick={() => onPatientSelect(patient.id)}>{patient.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PatientList;