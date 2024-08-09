import React, { useState, useEffect } from "react";
import { Lab } from "@prisma/client";
import { labRepository } from "../db/repositories/lab-repository";
import { useSelectedPatients } from "../stores/selectedPatientsStore";
import { JsonObject } from "@prisma/client/runtime/library";

interface LabResult extends JsonObject {
    column: string;
    value: string;
    annotations: string;
}

const LabTable: React.FC = () => {
    const { selectedPatients } = useSelectedPatients();
    const [labs, setLabs] = useState<Lab[]>([]);
    const [dateRange, setDateRange] = useState<string>("last");
    const [pinnedNotes, setPinnedNotes] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        fetchLabs();
    }, [selectedPatients, dateRange]);

    const fetchLabs = async () => {
        const allLabs = await Promise.all(selectedPatients.map((patientId) => labRepository.getLabsForPatient(patientId)));
        const flattenedLabs = allLabs.flat();
        const filteredLabs = filterLabsByDateRange(flattenedLabs);
        setLabs(filteredLabs);
    };

    const filterLabsByDateRange = (labs: Lab[]): Lab[] => {
        switch (dateRange) {
            case "last":
                return labs.slice(0, 1);
            case "last2":
                return labs.slice(0, 2);
            case "last3":
                return labs.slice(0, 3);
            case "last7days":
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return labs.filter((lab) => new Date(lab.collectedDate) >= sevenDaysAgo);
            case "last14days":
                const fourteenDaysAgo = new Date();
                fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
                return labs.filter((lab) => new Date(lab.collectedDate) >= fourteenDaysAgo);
            default:
                return labs;
        }
    };

    const handleAnnotationChange = (labId: number, column: string, annotation: string) => {
        setLabs((prevLabs) =>
            prevLabs.map((lab) => {
                if (lab.id === labId) {
                    const updatedResults = (lab.results as LabResult[]).map((result) => {
                        if (result.column === column) {
                            return { ...result, annotations: annotation };
                        }
                        return result;
                    });
                    return { ...lab, results: updatedResults };
                }
                return lab;
            })
        );
    };

    const togglePinNote = (labId: number, column: string) => {
        const key = `${labId}-${column}`;
        setPinnedNotes((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="overflow-x-auto">
            <div className="mb-4">
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="p-2 border rounded">
                    <option value="last">Last lab</option>
                    <option value="last2">Last 2 labs</option>
                    <option value="last3">Last 3 labs</option>
                    <option value="last7days">Last 7 days</option>
                    <option value="last14days">Last 14 days</option>
                </select>
            </div>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="border p-2">Patient</th>
                        <th className="border p-2">Date</th>
                        {labs[0] &&
                            (labs[0].results as LabResult[]).map((result) => (
                                <th key={result.column} className="border p-2">
                                    {result.column}
                                </th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {labs.map((lab) => (
                        <tr key={lab.id}>
                            <td className="border p-2">{lab.userId}</td>
                            <td className="border p-2">{new Date(lab.collectedDate).toLocaleDateString()}</td>
                            {(lab.results as LabResult[]).map((result) => (
                                <td key={result.column} className="border p-2 relative">
                                    <div>{result.value}</div>
                                    <div className="mt-2">
                                        <textarea
                                            value={result.annotations}
                                            onChange={(e) =>
                                                handleAnnotationChange(lab.id, result.column, e.target.value)
                                            }
                                            className="w-full p-1 border rounded"
                                            rows={2}
                                        />
                                        <button
                                            onClick={() => togglePinNote(lab.id, result.column)}
                                            className="absolute top-2 right-2 text-blue-500"
                                        >
                                            📌
                                        </button>
                                    </div>
                                    {pinnedNotes[`${lab.id}-${result.column}`] && (
                                        <div className="absolute top-full left-0 bg-white border p-2 shadow-lg z-10">
                                            {result.annotations}
                                        </div>
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LabTable;
