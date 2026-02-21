import { getUpcomingAppointments, getCalendarStats } from "@/actions/calendar";
import CalendarClient from "./CalendarClient";

export default async function CalendarPage() {
    let appointments: any[] = [];
    let stats = { totalMeetings: 0, avgDuration: "28 min", noShows: 0 };

    try {
        appointments = await getUpcomingAppointments();
        stats = await getCalendarStats();
    } catch (error) {
        console.error("Failed to load calendar:", error);
    }

    return <CalendarClient initialAppointments={appointments} stats={stats} />;
}
