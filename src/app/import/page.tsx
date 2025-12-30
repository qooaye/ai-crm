"use client";

import { useState } from "react";

export default function ImportPage() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setStatus("loading");
        setMessage("Processing your list...");

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target?.result as string;
            try {
                const response = await fetch("/api/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content, type: file.name.endsWith(".json") ? "json" : "csv" }),
                });

                if (response.ok) {
                    setStatus("success");
                    setMessage("Contacts imported successfully!");
                } else {
                    throw new Error("Failed to import contacts");
                }
            } catch (error) {
                setStatus("error");
                setMessage("An error occurred during import.");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="glass p-8">
                <h1 className="text-3xl font-bold mb-6">Import Contacts</h1>
                <p className="text-gray-400 mb-8">Upload your CSV or JSON file to bring your contacts into AI CRM.</p>

                <div className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center hover:border-primary/50 transition-colors mb-8">
                    <input
                        type="file"
                        accept=".csv,.json"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-4xl mb-4">📄</div>
                        <div className="text-lg font-medium mb-2">
                            {file ? file.name : "Click to select a file"}
                        </div>
                        <div className="text-sm text-gray-500">Supports .csv and .json formats</div>
                    </label>
                </div>

                {status !== "idle" && (
                    <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${status === "loading" ? "bg-blue-500/10 text-blue-400" :
                            status === "success" ? "bg-green-500/10 text-green-400" :
                                "bg-red-500/10 text-red-400"
                        }`}>
                        <span>{message}</span>
                    </div>
                )}

                <button
                    onClick={handleImport}
                    disabled={!file || status === "loading"}
                    className="w-full premium-btn disabled:opacity-50 disabled:cursor-not-allowed py-4 text-lg"
                >
                    {status === "loading" ? "Importing..." : "Start Import"}
                </button>
            </div>
        </div>
    );
}
