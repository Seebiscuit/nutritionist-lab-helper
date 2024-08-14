import React, { useState, useEffect, useMemo } from "react";
import { useSelectedPatients } from "../stores/selectedPatientsStore";
import { useFetchPatientsWithLabs } from "../services/http/usePatients";
import { Prisma } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";
import { LAB_FIELDS } from "@/services/enums/lab-fields";

type PatientLab = Prisma.LabGetPayload<{}> & { patientName: string };

interface LabResult extends JsonObject {
    column: string;
    value: string;
    annotations: string;
    isVirtual?: boolean;
}

const LabTable: React.FC = () => {
    const { selectedPatients } = useSelectedPatients();
    const { data: patientsWithLabs, isLoading, error } = useFetchPatientsWithLabs(selectedPatients);
    const [dateRange, setDateRange] = useState<string>("last");
    const labs = useMemo(() => {
        if (!patientsWithLabs) return [];

        return patientsWithLabs
            .filter((patient) => selectedPatients.includes(patient.id))
            .flatMap((patient) => {
                return patient.labs.map((lab) => {
                    const labResults = lab.results as LabResult[];
                    LAB_FIELDS.forEach((field) => {
                        if (!labResults.some((result) => result.column === field)) {
                            labResults.push({
                                column: field,
                                value: "",
                                annotations: "",
                                isVirtual: true,
                            });
                        }
                    });

                    return { ...lab, patientName: patient.name };
                });
            });
    }, [patientsWithLabs, selectedPatients]);

    const filterLabsByDateRange = (labs: PatientLab[]) => {
        switch (dateRange) {
            case "last":
            case "last2":
            case "last3": {
                const n = parseInt(dateRange.replace("last", "")) || 1;
                const latestLabsPerPatient = selectedPatients.reduce((filteredLabs, patientId) => {
                    const patientLabs = labs.filter((lab) => lab.patientId === patientId);

                    if (patientLabs.length <= n) return filteredLabs.concat(patientLabs);

                    const sortedLabs = patientLabs.sort(
                        (a, b) => new Date(b.collectedDate).getTime() - new Date(a.collectedDate).getTime()
                    );
                    const lastNLabs = sortedLabs.slice(0, n);

                    return filteredLabs.concat(lastNLabs);
                }, [] as PatientLab[]);

                return latestLabsPerPatient;
            }
            case "last30days":
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return labs.filter((lab) => new Date(lab.collectedDate) >= thirtyDaysAgo);
            case "last60days":
                const sixtyDaysAgo = new Date();
                sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                return labs.filter((lab) => new Date(lab.collectedDate) >= sixtyDaysAgo);
            case "last90days":
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                return labs.filter((lab) => new Date(lab.collectedDate) >= ninetyDaysAgo);
            default:
                return labs;
        }
    };

    const filteredLabs = useMemo(() => {
        return filterLabsByDateRange(labs);
    }, [labs, dateRange]);

    if (error) return <div>Error loading labs: {error.message}</div>;

    return (
        <div className="text-black overflow-auto">
            <div className="mb-4">
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-purple-200 p-2 border rounded"
                >
                    <option value="last">Last lab</option>
                    <option value="last2">Last 2 labs</option>
                    <option value="last3">Last 3 labs</option>
                    <option value="last7days">Last 30 days</option>
                    <option value="last14days">Last 60 days</option>
                    <option value="last14days">Last 90 days</option>
                </select>
            </div>
            <table className="bg-purple-200 min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="border p-2">Patient</th>
                        <th className="border p-2">Date</th>
                        {filteredLabs[0] &&
                            (filteredLabs[0].results as LabResult[]).map((result) => (
                                <th key={result.column} className="border p-2 min-w-20">
                                    {result.column}
                                </th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {isLoading && (
                        <tr>
                            <td className="p-2">Loading...</td>
                        </tr>
                    )}
                    {filteredLabs.map((lab) => (
                        <tr key={lab.id}>
                            <td className="border p-2">{lab.patientName}</td>
                            <td className="border p-2">{new Date(lab.collectedDate).toLocaleDateString()}</td>
                            {(lab.results as LabResult[]).map((result) => (
                                <td
                                    key={result.column}
                                    className="border p-2 text-center min-w-10"
                                    data-hook="lab-result"
                                >
                                    {result.isVirtual ? (
                                        <div className="text-gray-400 italic">No data</div>
                                    ) : (
                                        <div>{result.value}</div>
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
