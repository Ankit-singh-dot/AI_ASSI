import { getLeads } from "@/actions/leads";
import LeadsClient from "./LeadsClient";

export default async function LeadsPage() {
    let leads: any[] = [];
    try {
        leads = await getLeads();
    } catch (error) {
        console.error("Failed to load leads:", error);
    }

    return <LeadsClient initialLeads={leads} />;
}
