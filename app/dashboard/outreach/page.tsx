import { getLeads } from "@/actions/leads";
import { getCallHistory } from "@/actions/voice-call";
import OutreachClient from "./OutreachClient";

export default async function OutreachPage() {
    let leads: any[] = [];
    let callHistory: any[] = [];
    try {
        leads = await getLeads();
    } catch (error) {
        console.error("Failed to load leads:", error);
    }
    try {
        callHistory = await getCallHistory();
    } catch (error) {
        console.error("Failed to load call history:", error);
    }

    return <OutreachClient leads={leads} initialCallHistory={callHistory} />;
}
