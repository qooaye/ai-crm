import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const contacts = await prisma.contact.findMany({
            select: { id: true, name: true, email: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(contacts);
    } catch {
        return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
    }
}
