import { getAnalyticsData } from "@/actions/analytics";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
    let data = null;
    try {
        data = await getAnalyticsData();
    } catch (error) {
        console.error("Failed to load analytics:", error);
    }

    if (!data) {
        return (
            <div className="p-8 text-center text-zinc-400">
                Unable to load analytics. Please complete your profile first.
            </div>
        );
    }

    return <AnalyticsClient data={data} />;
}
