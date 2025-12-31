import { NextResponse } from "next/server";
import { sendEmail } from "../../../lib/email";
import prisma from "../../../lib/prisma";

export async function POST(request: Request) {
    try {
        const { to, subject, body } = await request.json();

        const result = await sendEmail({ to, subject, body });

        if (result.success) {
            // Log the email in the database
            const contact = await prisma.contact.findUnique({
                where: { email: to }
            });

            if (contact) {
                await prisma.emailLog.create({
                    data: {
                        subject,
                        body,
                        contactId: contact.id,
                    }
                });
            }

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
        }
    } catch (error) {
        console.error("Email API error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
