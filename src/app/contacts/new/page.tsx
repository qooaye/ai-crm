"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewContactPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [tags, setTags] = useState("");
    const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) return;

        setStatus("saving");
        setErrorMsg("");

        try {
            const response = await fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, tags }),
            });

            if (response.ok) {
                setStatus("success");
                setTimeout(() => router.push("/contacts"), 1500);
            } else {
                const data = await response.json();
                throw new Error(data.error || "Failed to create contact");
            }
        } catch (err: any) {
            setStatus("error");
            setErrorMsg(err.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="glass p-8">
                <h1 className="text-3xl font-bold mb-8">Add New Contact</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Full Name *</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Email Address *</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="input-field"
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="input-field"
                            placeholder="vip, client, lead"
                        />
                    </div>

                    {status === "success" && (
                        <div className="p-4 bg-green-500/10 text-green-400 rounded-lg">
                            Contact created successfully! Redirecting...
                        </div>
                    )}
                    {status === "error" && (
                        <div className="p-4 bg-red-500/10 text-red-400 rounded-lg">
                            {errorMsg}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={status === "saving"}
                            className="flex-1 premium-btn"
                        >
                            {status === "saving" ? "Saving..." : "Create Contact"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
