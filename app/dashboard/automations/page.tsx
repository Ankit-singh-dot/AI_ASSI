import { getAutomations, seedDefaultAutomations } from "@/actions/automations";
import AutomationsClient from "./AutomationsClient";

export default async function AutomationsPage() {
    let automations: any[] = [];
    try {
        // Seed smart defaults on first visit
        await seedDefaultAutomations();
        automations = await getAutomations();
    } catch (error) {
        console.error("Failed to load automations:", error);
    }

    return <AutomationsClient initialAutomations={automations} />;
}
