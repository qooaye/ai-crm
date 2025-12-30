"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ComposeEmailPage() {
    const searchParams = useSearchParams();
    const [to, setTo] = useState(searchParams.get("email") || "");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

    const handleSend = async () => {
        if (!to || !subject || !body) return;

        setStatus("sending");
        try {
            const response = await fetch("/api/emails", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ to, subject, body }),
            });

            if (response.ok) {
                setStatus("success");
            } else {
                throw new Error("Failed to send email");
            }
        } catch (error) {
            setStatus("error");
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12">
            <div className="glass p-8">
                <h1 className="text-3xl font-bold mb-8">Compose Email</h1>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Recipient Email</label>
                        <input
                            type="email"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="input-field"
                            placeholder="recipient@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="input-field"
                            placeholder="Enter subject..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Message</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            className="input-field h-64 resize-none"
                            placeholder="Write your email here..."
                        ></textarea>
                    </div>

                    {status === "success" && (
                        <div className="p-4 bg-green-500/10 text-green-400 rounded-lg">
                            Email sent successfully!
                        </div>
                    )}
                    {status === "error" && (
                        <div className="p-4 bg-red-500/10 text-red-400 rounded-lg">
                            Failed to send email. Please check your Resend API Key.
                        </div>
                    )}

                    <button
                        onClick={handleSend}
                        disabled={status === "sending"}
                        className="w-full premium-btn py-4 text-lg"
                    >
                        {status === "sending" ? "Sending..." : "Send Email"}
                    </button>
                </div>
            </div>
        </div>
    );
}
