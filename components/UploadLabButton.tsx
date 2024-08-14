import { useLabUpload } from "@/services/http/useLabUpload";

export default function UploadLabButton() {
    const labUpload = useLabUpload();

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const csvContent = e.target?.result as string;
            labUpload.mutate(csvContent);
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex justify-center">
            <label
                htmlFor="upload-lab-button"
                className="cursor-pointer bg-purple-100 hover:bg-purple-700 text-purple-500 font-bold py-2 px-4 rounded"
            >
                {labUpload.isPending ? "Uploading..." : "Upload Labs"}
            </label>
            <input id="upload-lab-button" type="file" className="hidden" accept=".csv" onChange={handleUpload} />
        </div>
    );
}
