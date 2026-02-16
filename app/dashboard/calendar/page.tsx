"use client";

import { Clock, Video, MapPin, User, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9 AM to 6 PM

const appointments = [
    { id: 1, title: "Demo — Priya Sharma", time: "10:00 AM", duration: "30 min", type: "demo", day: 2, hour: 10, color: "#3b82f6" },
    { id: 2, title: "Intro Call — Vikram Patel", time: "11:30 AM", duration: "15 min", type: "intro", day: 2, hour: 11, color: "#06b6d4" },
    { id: 3, title: "Consultation — Meera Joshi", time: "2:00 PM", duration: "1 hour", type: "consultation", day: 3, hour: 14, color: "#8b5cf6" },
    { id: 4, title: "Follow-up — Rajesh Kumar", time: "10:00 AM", duration: "15 min", type: "followup", day: 4, hour: 10, color: "#10b981" },
    { id: 5, title: "Demo — Suresh Nair", time: "3:00 PM", duration: "30 min", type: "demo", day: 5, hour: 15, color: "#3b82f6" },
];

const upcomingAppointments = [
    { name: "Priya Sharma", type: "Product Demo", time: "Today, 10:00 AM", duration: "30 min", link: "meet.google.com/abc-xyz", avatar: "PS" },
    { name: "Vikram Patel", type: "Intro Call", time: "Today, 11:30 AM", duration: "15 min", link: "meet.google.com/def-uvw", avatar: "VP" },
    { name: "Meera Joshi", type: "Consultation", time: "Tomorrow, 2:00 PM", duration: "1 hour", link: "meet.google.com/ghi-rst", avatar: "MJ" },
    { name: "Rajesh Kumar", type: "Follow-up", time: "Thu, 10:00 AM", duration: "15 min", link: "meet.google.com/jkl-opq", avatar: "RK" },
];

export default function CalendarPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Calendar</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Manage appointments and availability</p>
                </div>
                <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.8rem" }}>
                    <Plus className="w-4 h-4" />
                    New Appointment
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Calendar */}
                <div className="lg:col-span-2 glass-card-static p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            February 2026
                        </h3>
                        <div className="flex items-center gap-2">
                            <button className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: "var(--accent-blue)", background: "rgba(59,130,246,0.1)" }}>
                                Today
                            </button>
                            <button className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-px mb-2">
                        {daysOfWeek.map((day, i) => (
                            <div
                                key={day}
                                className="text-center py-2 text-xs font-medium"
                                style={{ color: i === 2 ? "var(--accent-blue)" : "var(--text-muted)" }}
                            >
                                <div>{day}</div>
                                <div
                                    className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center mx-auto text-sm font-semibold ${i === 2 ? "" : ""
                                        }`}
                                    style={{
                                        background: i === 2 ? "var(--accent-blue)" : "transparent",
                                        color: i === 2 ? "white" : "var(--text-secondary)",
                                    }}
                                >
                                    {15 + i}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Time grid */}
                    <div className="relative" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="grid grid-cols-7 gap-px"
                                style={{
                                    height: "52px",
                                    borderBottom: "1px solid var(--border-subtle)",
                                }}
                            >
                                <div
                                    className="col-span-1 flex items-start px-2 pt-1 text-[10px]"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? "12 PM" : `${hour} AM`}
                                </div>
                                {[1, 2, 3, 4, 5, 6].map((dayIdx) => {
                                    const appt = appointments.find(
                                        (a) => a.day === dayIdx && a.hour === hour
                                    );
                                    return (
                                        <div key={dayIdx} className="relative">
                                            {appt && (
                                                <div
                                                    className="absolute inset-x-0.5 top-0.5 p-1.5 rounded-md text-[10px] font-medium cursor-pointer transition-opacity duration-200 hover:opacity-80"
                                                    style={{
                                                        background: `${appt.color}20`,
                                                        borderLeft: `3px solid ${appt.color}`,
                                                        color: appt.color,
                                                    }}
                                                >
                                                    <p className="truncate">{appt.title.split("—")[0]}</p>
                                                    <p className="opacity-60">{appt.time}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming sidebar */}
                <div className="space-y-6">
                    <div className="glass-card-static p-5">
                        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                            Upcoming Appointments
                        </h3>
                        <div className="space-y-3">
                            {upcomingAppointments.map((appt, i) => (
                                <div
                                    key={i}
                                    className="p-3 rounded-xl transition-colors duration-200"
                                    style={{ background: "rgba(15,23,42,0.3)", border: "1px solid var(--border-subtle)" }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                            style={{ background: "var(--gradient-hero)", color: "white" }}
                                        >
                                            {appt.avatar}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                                                {appt.name}
                                            </p>
                                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{appt.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                                            <Clock className="w-3 h-3" /> {appt.time}
                                        </span>
                                        <span style={{ color: "var(--text-muted)" }}>{appt.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2 text-xs" style={{ color: "var(--accent-blue)" }}>
                                        <Video className="w-3 h-3" />
                                        <span className="truncate">{appt.link}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Booking stats */}
                    <div className="glass-card-static p-5">
                        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                            This Week
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: "Total Meetings", value: "12", icon: User },
                                { label: "Avg Duration", value: "28 min", icon: Clock },
                                { label: "No-Shows", value: "1", icon: MapPin },
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
        </div>
    );
}
