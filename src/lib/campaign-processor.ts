import { Resend } from "resend";
import prisma from "./prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function processCampaign(campaign: any) {
    const { subject, body } = campaign.template;
    let successCount = 0;
    const errors: string[] = [];

    // console.log(`[PROCESSOR] Starting campaign: ${campaign.name} (${campaign.id})`);

    for (const contact of campaign.contacts) {
        const personalizedBody = body.replace(/{name}/g, contact.name);

        try {
            // Rate Limit
            await new Promise(resolve => setTimeout(resolve, 500)); // Slightly faster for manual send, but safe

            const { error } = await resend.emails.send({
                from: 'AI CRM <onboarding@resend.dev>',
                to: contact.email,
                subject: subject,
                text: personalizedBody
            });

            if (error) throw new Error(error.message);

            await prisma.emailLog.create({
                data: {
                    subject: subject,
                    body: personalizedBody,
                    contactId: contact.id
                }
            });
            successCount++;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            errors.push(errorMessage);
            console.error(`[PROCESSOR] Failed to send to ${contact.email}:`, errorMessage);

            await prisma.emailLog.create({
                data: {
                    subject: `[FAILED] ${subject}`,
                    body: `Error sending email: ${errorMessage}`,
                    contactId: contact.id
                }
            });
        }
    }

    // Update status to SENT
    await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { status: "SENT" }
    });

    return { successCount, errors };
}
