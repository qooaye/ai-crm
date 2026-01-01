import prisma from "../../lib/prisma";

export const dynamic = "force-dynamic";

async function getContacts() {
    try {
        return await prisma.contact.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Failed to fetch contacts:", error);
        return [];
    }
}

export default async function ContactPage() {
    const contacts = await getContacts();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Contacts</h1>
                    <p className="text-gray-400">Manage and interact with your relationships.</p>
                </div>
                <div className="flex gap-4">
                    <a href="/contacts/new" className="premium-btn">Add Contact</a>
                    <a href="/api/export" target="_blank" className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-all block">Export</a>
                </div>
            </div>

            <div className="glass overflow-hidden">
                <table className="w-full text-left">
                    <thead className="border-b border-white/5 bg-white/5">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Phone</th>
                            <th className="px-6 py-4 font-medium">Tags</th>
                            <th className="px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No contacts found. Try importing your list.
                                </td>
                            </tr>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            contacts.map((contact: any) => (
                                <tr key={contact.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">{contact.name}</td>
                                    <td className="px-6 py-4 text-gray-400">{contact.email}</td>
                                    <td className="px-6 py-4 text-gray-400">{contact.phone || "-"}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {contact.tags.map((tag: any) => (
                                                <span key={tag} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">{tag}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-primary hover:underline">View</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
