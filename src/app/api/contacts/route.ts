import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function POST(request: Request) {
    try {
        const { name, email, phone, tags } = await request.json();

        if (!name || !email) {
            return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
        }

        const tagList = tags ? tags.split(",").map((t: string) => t.trim()).filter((t: string) => t) : [];

        const contact = await prisma.contact.create({
            data: {
                name,
                email,
                phone: phone || null,
                tags: tagList,
            }
        });

        return NextResponse.json({ success: true, contact });
    } catch (error) {
        console.error("Create contact error:", error);
        return NextResponse.json({ error: "Failed to create contact or email already exists" }, { status: 500 });
    }
}
