import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { processCampaign } from "../../../../lib/campaign-processor";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        console.log("[CRON] Starting campaign check...");
        const now = new Date();

        // 1. Fetch ALL scheduled campaigns
        const allScheduled = await prisma.emailCampaign.findMany({
            where: { status: "SCHEDULED" },
            include: { contacts: true, template: true }
        });

        // 2. Build detailed debug log
        const debugLog = {
            serverTime: now.toISOString(),
            serverTimeLocalGuess: now.toLocaleString(),
            totalScheduled: allScheduled.length,
            campaigns: allScheduled.map(c => {
                const isTimeReady = c.scheduledAt ? c.scheduledAt <= now : true; // If null, assume ready (though usually scheduled has date)
                const hasContacts = c.contacts.length > 0;

                let rejectionReason = null;
                if (!isTimeReady) rejectionReason = `Not time yet (Scheduled: ${c.scheduledAt?.toISOString()})`;
                else if (!hasContacts) rejectionReason = "No contacts";

                return {
                    id: c.id,
                    name: c.name,
                    scheduledAt: c.scheduledAt?.toISOString(),
                    contactsCount: c.contacts.length,
                    isDue: isTimeReady && hasContacts,
                    reason: rejectionReason || "Ready to send"
                };
            })
        };

        // 3. Filter due campaigns
        const dueCampaigns = allScheduled.filter(c => {
            const isTimeReady = c.scheduledAt ? c.scheduledAt <= now : true;
            return isTimeReady && c.contacts.length > 0;
        });

        if (dueCampaigns.length === 0) {
            console.log("[CRON] No due campaigns to process.", JSON.stringify(debugLog, null, 2));
            return NextResponse.json({
                message: "No due campaigns processed",
                debug: debugLog
            });
        }

        const results = [];

        // 4. Process
        for (const campaign of dueCampaigns) {
            try {
                console.log(`[CRON] Processing campaign: ${campaign.name} (${campaign.id})`);
                console.log(`[CRON] Template:`, campaign.template);
                console.log(`[CRON] Contacts:`, campaign.contacts.length);
                
                const { successCount, errors } = await processCampaign(campaign);
                results.push({
                    campaign: campaign.name,
                    processed: successCount,
                    errors: errors.length,
                    errorDetails: errors
                });
            } catch (campaignError: unknown) {
                const errorMsg = campaignError instanceof Error ? campaignError.message : String(campaignError);
                console.error(`[CRON] Failed to process campaign ${campaign.name}:`, errorMsg);
                results.push({
                    campaign: campaign.name,
                    processed: 0,
                    errors: 1,
                    errorDetails: [errorMsg]
                });
            }
        }

        return NextResponse.json({ success: true, processed: results, debug: debugLog });
    } catch (e) {
        console.error("[CRON] Critical error:", e);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return NextResponse.json({ error: "Failed to process", details: (e as any).message }, { status: 500 });
    }
}
