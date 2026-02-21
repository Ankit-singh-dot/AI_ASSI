import { getLeads } from "@/actions/leads";
import OutreachClient from "./OutreachClient";

export default async function OutreachPage() {
    let leads: any[] = [];
    try {
        leads = await getLeads();
    } catch (error) {
        console.error("Failed to load leads:", error);
    }

    return <OutreachClient leads={leads} />;
}
