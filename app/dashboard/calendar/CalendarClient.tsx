"use client";

import { useState } from "react";
import { Clock, Video, User, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { createAppointment, deleteAppointment } from "@/actions/calendar";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";

function formatAppointmentTime(dateStr: string) {
    const date = new Date(dateStr);
    if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, "h:mm a")}`;
    return format(date, "EEE, h:mm a");
}

export default function CalendarClient({
    initialAppointments,
    stats,
}: {
    initialAppointments: any[];
    stats: { totalMeetings: number; avgDuration: string; noShows: number };
}) {
    const [appointments, setAppointments] = useState(initialAppointments);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newAppt, setNewAppt] = useState({
        title: "",
        type: "demo",
        startTime: "",
        duration: "30",
        meetingLink: "",
    });

    const handleCreate = async () => {
        if (!newAppt.title.trim() || !newAppt.startTime) return;
        setIsCreating(true);
        try {
            const startDate = new Date(newAppt.startTime);
            const endDate = new Date(startDate.getTime() + parseInt(newAppt.duration) * 60000);
            const created = await createAppointment({
                title: newAppt.title,
                type: newAppt.type,
                startTime: startDate.toISOString(),
                endTime: endDate.toISOString(),
                duration: `${newAppt.duration} min`,
                meetingLink: newAppt.meetingLink || undefined,
            });
            setAppointments((prev) => [...prev, created].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()));
            setShowAddModal(false);
            setNewAppt({ title: "", type: "demo", startTime: "", duration: "30", meetingLink: "" });
        } catch (error) {
            console.error("Failed to create appointment:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAppointment(id);
            setAppointments((prev) => prev.filter((a) => a.id !== id));
        } catch (error) {
            console.error("Failed to delete:", error);
        }
    };

    const typeColors: Record<string, string> = {
        demo: "#3b82f6",
        intro: "#06b6d4",
        consultation: "#8b5cf6",
        followup: "#10b981",
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Calendar</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Manage appointments and availability</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                    <Plus className="w-4 h-4" />
                    New Appointment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming appointments list */}
                <div className="lg:col-span-2 glass-card-static p-5">
                    <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                        Upcoming Appointments
                    </h3>
                    {appointments.length === 0 ? (
                        <div className="py-12 text-center text-sm text-zinc-500">
                            No upcoming appointments. Click "New Appointment" to schedule one.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointments.map((appt) => (
                                <div
                                    key={appt.id}
                                    className="p-4 rounded-xl transition-colors duration-200 group"
                                    style={{ background: "rgba(15,23,42,0.3)", border: "1px solid var(--border-subtle)" }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                                style={{ background: `${typeColors[appt.type] || "#3b82f6"}15` }}
                                            >
                                                <CalendarIcon className="w-5 h-5" style={{ color: typeColors[appt.type] || "#3b82f6" }} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                    {appt.title}
                                                </p>
                                                <div className="flex items-center gap-3 text-xs mt-1">
                                                    <span className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                                                        <Clock className="w-3 h-3" /> {formatAppointmentTime(appt.startTime)}
                                                    </span>
                                                    <span style={{ color: "var(--text-muted)" }}>{appt.duration}</span>
                                                    <span
                                                        className="px-2 py-0.5 rounded-full text-[10px] capitalize font-medium"
                                                        style={{ background: `${typeColors[appt.type] || "#3b82f6"}15`, color: typeColors[appt.type] || "#3b82f6" }}
                                                    >
                                                        {appt.type}
                                                    </span>
                                                </div>
                                                {appt.meetingLink && (
                                                    <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "var(--accent-blue)" }}>
                                                        <Video className="w-3 h-3" />
                                                        <span className="truncate">{appt.meetingLink}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(appt.id)}
                                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"
                                            style={{ color: "var(--text-muted)" }}
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Stats sidebar */}
                <div className="space-y-6">
                    <div className="glass-card-static p-5">
                        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                            This Week
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: "Total Meetings", value: stats.totalMeetings.toString(), icon: User },
                                { label: "Avg Duration", value: stats.avgDuration, icon: Clock },
                            ].map((stat) => (
                                <div key={stat.label} className="flex items-center justify-between">
                                    <span className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                                        <stat.icon className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                        {stat.label}
                                    </span>
                                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                        {stat.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Appointment Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white">New Appointment</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Title *"
                                value={newAppt.title}
                                onChange={(e) => setNewAppt({ ...newAppt, title: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                                style={{ border: "1px solid var(--border-subtle)" }}
                            />
                            <select
                                value={newAppt.type}
                                onChange={(e) => setNewAppt({ ...newAppt, type: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                                style={{ border: "1px solid var(--border-subtle)" }}
                            >
                                <option value="demo">Demo</option>
                                <option value="intro">Intro Call</option>
                                <option value="consultation">Consultation</option>
                                <option value="followup">Follow-up</option>
                            </select>
                            <input
                                type="datetime-local"
                                value={newAppt.startTime}
                                onChange={(e) => setNewAppt({ ...newAppt, startTime: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                                style={{ border: "1px solid var(--border-subtle)" }}
                            />
                            <select
                                value={newAppt.duration}
                                onChange={(e) => setNewAppt({ ...newAppt, duration: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                                style={{ border: "1px solid var(--border-subtle)" }}
                            >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="45">45 minutes</option>
                                <option value="60">1 hour</option>
                            </select>
                            <input
                                type="url"
                                placeholder="Meeting link (optional)"
                                value={newAppt.meetingLink}
                                onChange={(e) => setNewAppt({ ...newAppt, meetingLink: e.target.value })}
                                className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                                style={{ border: "1px solid var(--border-subtle)" }}
                            />
                        </div>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating || !newAppt.title.trim() || !newAppt.startTime}
                            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                background: "var(--accent-blue)",
                                color: "white",
                                opacity: isCreating ? 0.7 : 1,
                            }}
                        >
                            {isCreating ? "Scheduling..." : "Schedule Appointment"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
