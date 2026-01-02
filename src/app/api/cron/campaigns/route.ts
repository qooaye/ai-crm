import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
    try {
        console.log("[CRON] Starting campaign check...");
        const now = new Date();

        // 1. Fetch ALL scheduled campaigns to debug why they aren't matching
        const allScheduled = await prisma.emailCampaign.findMany({
            where: { status: "SCHEDULED" },
            include: { contacts: true, template: true }
        });

        console.log(`[CRON] Found ${allScheduled.length} scheduled campaigns.`);

        const debugLog = {
            serverTime: now.toISOString(),
            totalScheduled: allScheduled.length,
            campaigns: allScheduled.map(c => ({
                id: c.id,
                name: c.name,
                scheduledAt: c.scheduledAt?.toISOString(),
                contactsCount: c.contacts.length,
                isDue: c.scheduledAt ? c.scheduledAt <= now : false,
                reason: c.scheduledAt && c.scheduledAt > now ? "Future Time" : (c.contacts.length === 0 ? "No Contacts" : "Ready")
            }))
        };

        // 2. Filter for actual processing
        const dueCampaigns = allScheduled.filter(c => c.scheduledAt && c.scheduledAt <= now && c.contacts.length > 0);
        console.log(`[CRON] Processing ${dueCampaigns.length} due campaigns.`);

        if (dueCampaigns.length === 0) {
            console.log("[CRON] No due campaigns to process.");
            return NextResponse.json({
                message: "No due campaigns processed",
                debug: debugLog
            });
        }

        const results = [];

        // 3. Process each campaign
        for (const campaign of dueCampaigns) {
            const { subject, body } = campaign.template;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const campaignResults = await Promise.allSettled(campaign.contacts.map(async (contact: any) => {
                const personalizedBody = body.replace(/{name}/g, contact.name);

                try {
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
                } catch (err: unknown) {
                    // Log failure
                    console.error("Email send failed:", err);
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    await prisma.emailLog.create({
                        data: {
                            subject: `[FAILED] ${subject}`,
                            body: `Error sending email: ${errorMessage}`,
                            contactId: contact.id
                        }
                    });
                }
            }));

            await prisma.emailCampaign.update({
                where: { id: campaign.id },
                data: { status: "SENT" }
            });

            results.push({
                campaign: campaign.name,
                processed: campaignResults.length
            });
        }

        return NextResponse.json({ success: true, processed: results, debug: debugLog });
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return NextResponse.json({ error: "Failed to process", details: (e as any).message }, { status: 500 });
    }
}
