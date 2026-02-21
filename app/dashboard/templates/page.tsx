import { getQuickReplies } from "@/actions/quick-replies";
import TemplatesClient from "./TemplatesClient";

export default async function TemplatesPage() {
    let replies: any[] = [];
    try {
        replies = await getQuickReplies();
    } catch (error) {
        console.error("Failed to load templates:", error);
    }

    return <TemplatesClient initialReplies={replies} />;
}
