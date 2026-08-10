import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadFile } from "@/api/files";




export function UploadSection() {

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleFileChange(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        if (!event.target.files?.length) return;

        setSelectedFile(event.target.files[0]);
    }

    function openFilePicker() {
        fileInputRef.current?.click();
    }

    async function handleUpload() {
        if (!selectedFile) {
            alert("Please select a file");
            return;
        }

        try {
            await uploadFile(selectedFile);

            alert("File uploaded successfully!");

            setSelectedFile(null);
        } catch (error) {
            console.error(error);

            alert("Upload failed");
        }
    }

    return (

        <section className="mx-auto mt-8 max-w-6xl rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold">
                Upload File
            </h2>

            {/* Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
            />

            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={openFilePicker}
                >
                    Choose File
                </Button>

                <span className="text-sm text-slate-500">
                    {selectedFile
                        ? selectedFile.name
                        : "No file selected"}
                </span>

                <Button onClick={handleUpload}>
                    Upload
                </Button>
            </div>
        </section>
    );

}