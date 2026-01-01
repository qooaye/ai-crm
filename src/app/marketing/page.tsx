"use client";

import { useState, useEffect } from "react";
// import ReactMarkdown from "react-markdown"; // Unused for now

export default function MarketingPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [contacts, setContacts] = useState<any[]>([]);
    const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

    // Unused state commented out for linting
    // const [templates, setTemplates] = useState<any[]>([]);
    // const [selectedTemplateId, setSelectedTemplateId] = useState("");

    const [newTemplateName, setNewTemplateName] = useState("");
    const [templateSubject, setTemplateSubject] = useState("");
    const [templateBody, setTemplateBody] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [testEmail, setTestEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    // const [message, setMessage] = useState("");

    // Fetch contacts and templates on load
    useEffect(() => {
        fetchContacts();
        // fetchTemplates();
    }, []);

    const fetchContacts = async () => {
        try {
            const data = await (await fetch("/api/contacts/list")).json();
            setContacts(data);
        } catch (e) { console.error("Failed to load contacts", e); }
    };

    /*
    const fetchTemplates = async () => {
         // Placeholder for when we have the API
    };
    */

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedContactIds(contacts.map(c => c.id));
        } else {
            setSelectedContactIds([]);
        }
    };

    const handleContactToggle = (id: string) => {
        setSelectedContactIds(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSendTest = async () => {
        if (!testEmail) return alert("Please enter a test email");
        setStatus("sending");
        try {
            const res = await fetch("/api/campaigns/test", {
                method: "POST",
                body: JSON.stringify({
                    email: testEmail,
                    subject: templateSubject,
                    body: templateBody
                })
            });
            if (res.ok) alert("Test email sent!");
            else throw new Error("Failed");
            setStatus("idle");
        } catch {
            alert("Failed to send test email");
            setStatus("idle");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-100px)]">
            {/* Left Panel: Settings */}
            <div className="lg:col-span-1 space-y-6 overflow-y-auto pr-2">

                {/* 1. Select Recipients */}
                <div className="glass p-6">
                    <h3 className="font-bold mb-4 flex justify-between items-center">
                        1. Select Recipients
                        <span className="text-xs font-normal text-gray-400">
                            {selectedContactIds.length} selected
                        </span>
                    </h3>
                    <div className="max-h-60 overflow-y-auto space-y-2 border border-white/10 rounded-lg p-2">
                        <label className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                            <input type="checkbox" onChange={handleSelectAll} checked={contacts.length > 0 && selectedContactIds.length === contacts.length} />
                            <span className="font-bold text-sm">Select All</span>
                        </label>
                        <hr className="border-white/10 my-2" />
                        {contacts.map(contact => (
                            <label key={contact.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedContactIds.includes(contact.id)}
                                    onChange={() => handleContactToggle(contact.id)}
                                />
                                <div className="text-sm">
                                    <div className="font-medium">{contact.name}</div>
                                    <div className="text-xs text-gray-400">{contact.email}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* 2. Template & Schedule */}
                <div className="glass p-6 space-y-4">
                    <h3 className="font-bold">2. Settings & Schedule</h3>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Load Template</label>
                        <select className="input-field" onChange={(e) => console.log("Load template", e.target.value)}>
                            <option value="">Select a template...</option>
                            <option value="new">+ Create New</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Save as New Template</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="e.g. New Year Promo"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                        />
                        <button className="text-xs text-primary mt-1 hover:underline">+ Save current draft</button>
                    </div>

                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Schedule Time (Optional)</label>
                        <input
                            type="datetime-local"
                            className="input-field"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave blank to send immediately.</p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                        <label className="block text-xs text-gray-400 mb-1">Test Recipient</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                className="input-field"
                                placeholder="test@example.com"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                            />
                            <button onClick={handleSendTest} className="px-3 py-2 border border-white/10 rounded hover:bg-white/5 transition-all text-sm whitespace-nowrap">
                                Test Send
                            </button>
                        </div>
                    </div>

                    <button
                        className="premium-btn w-full justify-center mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={status === "sending"}
                    >
                        {status === "sending" ? "Sending..." : (scheduledTime ? "Schedule Campaign" : "Send Campaign Now")}
                    </button>
                </div>
            </div>

            {/* Right Panel: Editor */}
            <div className="lg:col-span-2 glass p-6 flex flex-col h-full">
                <h3 className="font-bold mb-4">3. Edit Content</h3>
                <div className="space-y-4 flex-1 flex flex-col">
                    <input
                        type="text"
                        className="input-field text-lg font-medium"
                        placeholder="Email Subject Line"
                        value={templateSubject}
                        onChange={(e) => setTemplateSubject(e.target.value)}
                    />
                    <div className="flex-1 relative">
                        <textarea
                            className="w-full h-full bg-black/20 border border-white/10 rounded-xl p-4 resize-none focus:outline-none focus:border-primary/50 transition-all font-mono text-sm"
                            placeholder="Hi {name}, Check out our latest updates..."
                            value={templateBody}
                            onChange={(e) => setTemplateBody(e.target.value)}
                        ></textarea>
                        <div className="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none">
                            Markdown supported. Use {"{name}"} for dynamic names.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
