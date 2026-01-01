import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
    try {
        // 1. Find due campaigns
        const dueCampaigns = await prisma.emailCampaign.findMany({
            where: {
                status: "SCHEDULED",
                scheduledAt: {
                    lte: new Date()
                }
            },
            include: {
                contacts: true,
                template: true
            }
        });

        if (dueCampaigns.length === 0) {
            return NextResponse.json({ message: "No due campaigns found" });
        }

        const results = [];

        // 2. Process each campaign
        for (const campaign of dueCampaigns) {
            const { subject, body } = campaign.template;

            // Send to all contacts
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const campaignResults = await Promise.allSettled(campaign.contacts.map(async (contact: any) => {
                const personalizedBody = body.replace(/{name}/g, contact.name);

                await resend.emails.send({
                    from: 'AI CRM <onboarding@resend.dev>',
                    to: contact.email,
                    subject: subject,
                    text: personalizedBody
                });

                await prisma.emailLog.create({
                    data: {
                        subject,
                        body: personalizedBody,
                        contactId: contact.id
                    }
                });
            }));

            // 3. Update Campaign Status
            await prisma.emailCampaign.update({
                where: { id: campaign.id },
                data: { status: "SENT" }
            });

            results.push({
                campaign: campaign.name,
                processed: campaignResults.length
            });
        }

        return NextResponse.json({ success: true, processed: results });
    } catch {
        return NextResponse.json({ error: "Failed to process campaigns" }, { status: 500 });
    }
}
