import prisma from "../../lib/prisma";

async function getEmailLogs() {
    try {
        return await prisma.emailLog.findMany({
            include: { contact: true },
            orderBy: { sentAt: 'desc' }
        });
    } catch (error) {
        console.error("Failed to fetch email logs:", error);
        return [];
    }
}

export default async function EmailLogPage() {
    const logs = await getEmailLogs();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Email Logs</h1>
                <p className="text-gray-400">History of all sent communications.</p>
            </div>

            <div className="glass overflow-hidden">
                <table className="w-full text-left">
                    <thead className="border-b border-white/5 bg-white/5">
                        <tr>
                            <th className="px-6 py-4 font-medium">To</th>
                            <th className="px-6 py-4 font-medium">Subject</th>
                            <th className="px-6 py-4 font-medium">Sent At</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No emails sent yet.
                                </td>
                            </tr>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            logs.map((log: any) => (
                                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>{log.contact.name}</div>
                                        <div className="text-xs text-gray-500">{log.contact.email}</div>
                                    </td>
                                    <td className="px-6 py-4">{log.subject}</td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {new Date(log.sentAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Sent</span>
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
