"use client";

import { useState } from "react";
import {
    User,
    Building2,
    Bell,
    Shield,
    Palette,
    Link2,
    MessageSquare,
    Mail,
    Calendar,
    Globe,
    Check,
    ExternalLink,
    ChevronRight,
} from "lucide-react";

const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "integrations", label: "Integrations", icon: Link2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
];

const integrations = [
    { name: "WhatsApp Business", description: "Connected via Meta Cloud API", icon: MessageSquare, status: "connected", color: "#25D366" },
    { name: "Gmail", description: "OAuth connected — info@yourcompany.com", icon: Mail, status: "connected", color: "#EA4335" },
    { name: "Google Calendar", description: "Syncing with primary calendar", icon: Calendar, status: "connected", color: "#4285F4" },
    { name: "Website Forms", description: "Webhook active — capturing all submissions", icon: Globe, status: "connected", color: "#06b6d4" },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Settings</h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                    Manage your account, integrations, and preferences
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Settings Nav */}
                <div className="md:w-52 flex-shrink-0">
                    <div className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200`}
                                style={{
                                    background: activeTab === tab.id ? "rgba(59,130,246,0.1)" : "transparent",
                                    color: activeTab === tab.id ? "var(--accent-blue)" : "var(--text-muted)",
                                }}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Content */}
                <div className="flex-1">
                    {activeTab === "profile" && (
                        <div className="glass-card-static p-6 space-y-6">
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                Business Profile
                            </h2>

                            <div className="flex items-center gap-4 mb-6">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                    style={{ background: "var(--gradient-hero)" }}
                                >
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                        Sharma Retail Solutions
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        Retail • Mumbai, India
                                    </p>
                                    <button className="text-xs font-medium mt-1" style={{ color: "var(--accent-blue)" }}>
                                        Change Photo
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: "Business Name", value: "Sharma Retail Solutions", type: "text" },
                                    { label: "Industry", value: "Retail", type: "text" },
                                    { label: "Owner Name", value: "Rahul Sharma", type: "text" },
                                    { label: "Email", value: "rahul@sharmaretail.in", type: "email" },
                                    { label: "Phone", value: "+91 98765 43210", type: "tel" },
                                    { label: "Team Size", value: "5-10", type: "text" },
                                ].map((field) => (
                                    <div key={field.label}>
                                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            defaultValue={field.value}
                                            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                                            style={{
                                                background: "var(--bg-primary)",
                                                border: "1px solid var(--border-subtle)",
                                                color: "var(--text-primary)",
                                            }}
                                            onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                                            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                                    Business Hours
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        defaultValue="9:00 AM"
                                        className="w-28 px-4 py-2.5 rounded-xl text-sm outline-none text-center"
                                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                                    />
                                    <span className="text-sm" style={{ color: "var(--text-muted)" }}>to</span>
                                    <input
                                        type="text"
                                        defaultValue="6:00 PM"
                                        className="w-28 px-4 py-2.5 rounded-xl text-sm outline-none text-center"
                                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                                    />
                                </div>
                            </div>

                            <button className="btn-primary" style={{ padding: "10px 24px", fontSize: "0.85rem" }}>
                                Save Changes
                            </button>
                        </div>
                    )}

                    {activeTab === "integrations" && (
                        <div className="glass-card-static p-6 space-y-6">
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                Connected Integrations
                            </h2>

                            <div className="space-y-3">
                                {integrations.map((integ) => (
                                    <div
                                        key={integ.name}
                                        className="flex items-center justify-between p-4 rounded-xl"
                                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ background: `${integ.color}15` }}
                                            >
                                                <integ.icon className="w-5 h-5" style={{ color: integ.color }} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                    {integ.name}
                                                </p>
                                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                    {integ.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--accent-green)" }}>
                                                <Check className="w-3.5 h-3.5" />
                                                Connected
                                            </span>
                                            <button className="p-1.5 rounded-lg" style={{ color: "var(--text-muted)" }}>
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="btn-secondary w-full justify-center">
                                <Link2 className="w-4 h-4" />
                                Connect New Integration
                            </button>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="glass-card-static p-6 space-y-6">
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                Notification Preferences
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { label: "New lead notifications", description: "Get notified when a new lead is captured", enabled: true },
                                    { label: "Hot lead alerts", description: "Instant alert when a lead scores above 80", enabled: true },
                                    { label: "Negative sentiment alerts", description: "Alert when customer frustration is detected", enabled: true },
                                    { label: "Follow-up reminders", description: "Daily digest of pending follow-ups", enabled: false },
                                    { label: "Appointment reminders", description: "1 hour before each meeting", enabled: true },
                                    { label: "Weekly analytics report", description: "Summary of key metrics every Monday", enabled: false },
                                ].map((notif) => (
                                    <div
                                        key={notif.label}
                                        className="flex items-center justify-between p-4 rounded-xl"
                                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}
                                    >
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                {notif.label}
                                            </p>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                                                {notif.description}
                                            </p>
                                        </div>
                                        <button
                                            className="w-11 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0"
                                            style={{ background: notif.enabled ? "var(--accent-green)" : "var(--bg-tertiary)" }}
                                        >
                                            <div
                                                className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300"
                                                style={{ transform: notif.enabled ? "translateX(22px)" : "translateX(4px)" }}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="glass-card-static p-6 space-y-6">
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                Security Settings
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { label: "Change Password", description: "Last changed 30 days ago" },
                                    { label: "Two-Factor Authentication", description: "Add an extra layer of security" },
                                    { label: "API Keys", description: "Manage your API access tokens" },
                                    { label: "Active Sessions", description: "2 active sessions" },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        className="w-full text-left flex items-center justify-between p-4 rounded-xl transition-colors duration-200"
                                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-hover)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                                    >
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.description}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "appearance" && (
                        <div className="glass-card-static p-6 space-y-6">
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                Appearance
                            </h2>
                            <div>
                                <label className="block text-xs font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                                    Theme
                                </label>
                                <div className="flex items-center gap-3">
                                    {[
                                        { label: "Dark", active: true, preview: "var(--bg-primary)" },
                                        { label: "Light", active: false, preview: "#f8fafc" },
                                        { label: "System", active: false, preview: "linear-gradient(135deg, var(--bg-primary) 50%, #f8fafc 50%)" },
                                    ].map((theme) => (
                                        <button
                                            key={theme.label}
                                            className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200"
                                            style={{
                                                border: `2px solid ${theme.active ? "var(--accent-blue)" : "var(--border-subtle)"}`,
                                                background: theme.active ? "rgba(59,130,246,0.05)" : "transparent",
                                            }}
                                        >
                                            <div
                                                className="w-16 h-10 rounded-lg"
                                                style={{ background: theme.preview }}
                                            />
                                            <span className="text-xs font-medium" style={{ color: theme.active ? "var(--accent-blue)" : "var(--text-muted)" }}>
                                                {theme.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
