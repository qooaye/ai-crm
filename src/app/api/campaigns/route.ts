import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const {
            name,
            recipientIds,
            subject,
            body,
            scheduledAt,
            templateName
        } = await request.json();

        // 1. Save Template if name provided
        let templateId = null;
        if (templateName) {
            // Check if exists or create
            // For simplicity, we create a new one or update if logic implies. 
            // Here we just create a new template for the record
            const template = await prisma.emailTemplate.upsert({
                where: { name: templateName },
                update: { subject, body },
                create: {
                    name: templateName,
                    subject,
                    body,
                    variables: ["name"]
                }
            });
            templateId = template.id;
        }

        // 2. Create Campaign Record
        // If we don't have a templateId (one-off email), we might need a default or optional relation.
        // But schema requires templateId. So we should create a "One-off" template or require it.
        // Let's create a temporary hidden template if none provided, or just error.
        // For this demo, let's assume we create a generic one if missing.
        if (!templateId) {
            const defaultTemp = await prisma.emailTemplate.create({
                data: {
                    name: `Campaign-${Date.now()}`,
                    subject,
                    body,
                    variables: ["name"]
                }
            });
            templateId = defaultTemp.id;
        }

        const campaign = await prisma.emailCampaign.create({
            data: {
                name: name || subject || "Untitled Campaign",
                templateId,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                status: scheduledAt ? "SCHEDULED" : "DRAFT"
            }
        });

        // 3. Process Sending (If no schedule)
        if (!scheduledAt) {
            // Immediate Send
            const contacts = await prisma.contact.findMany({
                where: { id: { in: recipientIds } }
            });

            // Iterate and Send (Basic Batching)
            const results = await Promise.allSettled(contacts.map(async (contact: any) => {
                const personalizedBody = body.replace(/{name}/g, contact.name);

                // Send Email
                await resend.emails.send({
                    from: 'AI CRM <onboarding@resend.dev>',
                    to: contact.email,
                    subject: subject,
                    text: personalizedBody
                });

                // Log it
                await prisma.emailLog.create({
                    data: {
                        subject,
                        body: personalizedBody,
                        contactId: contact.id
                    }
                });
            }));

            // Update status
            await prisma.emailCampaign.update({
                where: { id: campaign.id },
                data: { status: "SENT" }
            });

            return NextResponse.json({ success: true, campaign, processed: results.length });
        }

        return NextResponse.json({ success: true, campaign, message: "Campaign Scheduled" });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }
}
