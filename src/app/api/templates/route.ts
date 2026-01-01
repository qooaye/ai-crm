import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
    try {
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(templates);
    } catch {
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, subject, body } = await request.json();

        if (!name || !subject || !body) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const template = await prisma.emailTemplate.upsert({
            where: { name },
            update: { subject, body },
            create: { name, subject, body, variables: ["name"] }
        });

        return NextResponse.json(template);
    } catch {
        return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
    }
}
