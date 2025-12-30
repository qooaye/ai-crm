import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, body }: { to: string, subject: string, body: string }) {
    try {
        const data = await resend.emails.send({
            from: 'AI CRM <onboarding@resend.dev>',
            to: [to],
            subject: subject,
            html: body,
        });

        return { success: true, data };
    } catch (error) {
        console.error("Email error:", error);
        return { success: false, error };
    }
}
