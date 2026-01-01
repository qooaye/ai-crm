import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const { email, subject, body } = await request.json();

        if (!email || !body) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Simple variable substitution for the test email (using "Test User" as name)
        const processedBody = body.replace(/{name}/g, "Test User");

        const data = await resend.emails.send({
            from: 'AI CRM <onboarding@resend.dev>',
            to: email,
            subject: subject || "Test Campaign Email",
            text: processedBody,
            // html: `<p>${processedBody}</p>` // Optional: rich text later
        });

        if (data.error) {
            return NextResponse.json({ error: data.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
