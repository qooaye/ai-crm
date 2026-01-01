import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const contacts = await prisma.contact.findMany({
            orderBy: { createdAt: 'desc' }
        });

        const csvHeader = "name,email,phone,tags\n";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const csvRows = contacts.map((c: any) => {
            const tags = c.tags ? `"${c.tags.join(',')}"` : "";
            return `${c.name},${c.email},${c.phone || ""},${tags}`;
        }).join("\n");

        return new NextResponse(csvHeader + csvRows, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="contacts_export_${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error("Export error:", error);
        return NextResponse.json({ error: "Failed to export contacts" }, { status: 500 });
    }
}
