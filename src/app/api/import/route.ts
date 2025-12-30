import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parse } from "csv-parse/sync";

export async function POST(request: Request) {
    try {
        const { content, type } = await request.json();

        let contacts: any[] = [];

        if (type === "csv") {
            const records = parse(content, {
                columns: true,
                skip_empty_lines: true,
            });
            contacts = records.map((r: any) => ({
                name: r.name || r.Name || "",
                email: r.email || r.Email || "",
                phone: r.phone || r.Phone || null,
                tags: r.tags ? r.tags.split(",").map((t: string) => t.trim()) : [],
            }));
        } else {
            contacts = JSON.parse(content);
        }

        // Upsert contacts
        const operations = contacts.map((c: any) =>
            prisma.contact.upsert({
                where: { email: c.email },
                update: {
                    name: c.name,
                    phone: c.phone,
                    tags: c.tags,
                },
                create: {
                    name: c.name,
                    email: c.email,
                    phone: c.phone,
                    tags: c.tags,
                },
            })
        );

        await Promise.all(operations);

        return NextResponse.json({ success: true, count: contacts.length });
    } catch (error) {
        console.error("Import error:", error);
        return NextResponse.json({ error: "Failed to process contacts" }, { status: 500 });
    }
}
