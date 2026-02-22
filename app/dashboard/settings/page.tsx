"use client";

import { useState, useEffect } from "react";
import { getUserProfile, updateBusinessProfile, updateNotificationSettings, updateTheme } from "@/actions/user";
import { getIntegrations, connectIntegration, disconnectIntegration, testIntegration } from "@/actions/integrations";
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
    Instagram,
    Zap,
    X,
    Copy,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react";

const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "integrations", label: "Integrations", icon: Link2 },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
];

const platformMeta: Record<string, { name: string; icon: any; color: string; connectedDesc: string; disconnectedDesc: string; fields: { key: string; label: string; placeholder: string; type?: string }[] }> = {
    whatsapp: {
        name: "WhatsApp Business",
        icon: MessageSquare,
        color: "#25D366",
        connectedDesc: "Connected via Meta Cloud API",
        disconnectedDesc: "Connect your WhatsApp Business account",
        fields: [
            { key: "apiKey", label: "Meta Cloud API Token", placeholder: "EAAxxxxxxx..." },
            { key: "phoneNumberId", label: "Phone Number ID", placeholder: "107xxxxx" },
        ],
    },
    instagram: {
        name: "Instagram DMs",
        icon: Instagram,
        color: "#E4405F",
        connectedDesc: "Connected via Instagram Graph API",
        disconnectedDesc: "Connect your Instagram Business account",
        fields: [
            { key: "apiKey", label: "Instagram Access Token", placeholder: "IGQVJxxxxxxx..." },
            { key: "igUserId", label: "Instagram User ID", placeholder: "17841xxxxx" },
        ],
    },
    gmail: {
        name: "Gmail",
        icon: Mail,
        color: "#EA4335",
        connectedDesc: "OAuth connected",
        disconnectedDesc: "Connect your Gmail account for email outreach",
        fields: [
            { key: "apiKey", label: "OAuth Refresh Token", placeholder: "1//0xxxxxxx..." },
            { key: "email", label: "Gmail Address", placeholder: "you@company.com", type: "email" },
        ],
    },
    calendar: {
        name: "Google Calendar",
        icon: Calendar,
        color: "#4285F4",
        connectedDesc: "Syncing with primary calendar",
        disconnectedDesc: "Sync appointments with Google Calendar",
        fields: [
            { key: "apiKey", label: "OAuth Refresh Token", placeholder: "1//0xxxxxxx..." },
            { key: "calendarId", label: "Calendar ID", placeholder: "primary" },
        ],
    },
    website_forms: {
        name: "Website Forms",
        icon: Globe,
        color: "#06b6d4",
        connectedDesc: "Webhook active — capturing all submissions",
        disconnectedDesc: "Capture leads from your website via webhook",
        fields: [
            { key: "webhookUrl", label: "Webhook URL (auto-generated)", placeholder: "" },
        ],
    },
    make_webhook: {
        name: "Make Automation (Campaigns)",
        icon: ExternalLink,
        color: "#9333ea",
        connectedDesc: "Connected for bulk actions",
        disconnectedDesc: "Send leads to a Make.com webhook",
        fields: [
            { key: "webhookUrl", label: "Make.com Webhook URL", placeholder: "https://hook.eu1.make.com/..." },
        ],
    },
    make_scraper_webhook: {
        name: "Make Automation (Scraper)",
        icon: ExternalLink,
        color: "#10b981", // Emerald to match scraper UI
        connectedDesc: "Connected for local lead scraping",
        disconnectedDesc: "Trigger a Make.com Google Maps Scraper",
        fields: [
            { key: "webhookUrl", label: "Make.com Scraper Webhook URL", placeholder: "https://hook.eu1.make.com/..." },
        ],
    },
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form inputs
    const [formData, setFormData] = useState({
        businessName: "",
        industry: "",
        businessHours: "",
        teamSize: "",
    });

    // Notification toggles
    const [notifications, setNotifications] = useState({
        notifyNewLead: true,
        notifyHotLead: true,
        notifyNegative: true,
        notifyFollowUps: false,
        notifyAppointments: true,
        notifyWeeklyReport: false,
    });

    const [selectedTheme, setSelectedTheme] = useState("system");

    // Integrations
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [connectModal, setConnectModal] = useState<string | null>(null); // platform key
    const [connectForm, setConnectForm] = useState<Record<string, string>>({});
    const [isConnecting, setIsConnecting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [isTesting, setIsTesting] = useState<string | null>(null);
    const [copiedWebhook, setCopiedWebhook] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            try {
                const user = await getUserProfile();
                if (user) {
                    setProfile(user);
                    setFormData({
                        businessName: user.businessName || "",
                        industry: user.industry || "",
                        businessHours: user.businessHours || "9:00 AM - 6:00 PM",
                        teamSize: user.teamSize || "",
                    });
                    setNotifications({
                        notifyNewLead: user.notifyNewLead ?? true,
                        notifyHotLead: user.notifyHotLead ?? true,
                        notifyNegative: user.notifyNegative ?? true,
                        notifyFollowUps: user.notifyFollowUps ?? false,
                        notifyAppointments: user.notifyAppointments ?? true,
                        notifyWeeklyReport: user.notifyWeeklyReport ?? false,
                    });
                    setSelectedTheme(user.theme || "system");
                }

                const intgs = await getIntegrations();
                setIntegrations(intgs);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadProfile();
    }, []);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateBusinessProfile(formData);
            alert("Profile saved successfully");
        } catch (error) {
            console.error(error);
            alert("Failed to save profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConnect = async (platform: string) => {
        setIsConnecting(true);
        try {
            const meta: Record<string, any> = {};
            const apiKey = connectForm.apiKey || "";
            const webhookUrl = connectForm.webhookUrl || "";

            // Put extra fields into metadata
            Object.entries(connectForm).forEach(([k, v]) => {
                if (k !== "apiKey" && k !== "webhookUrl") meta[k] = v;
            });

            const updated = await connectIntegration(platform, { apiKey, webhookUrl, metadata: meta });
            setIntegrations((prev) => prev.map((i) => (i.platform === platform ? updated : i)));
            setConnectModal(null);
            setConnectForm({});
        } catch (error) {
            console.error("Failed to connect:", error);
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async (integrationId: string) => {
        try {
            const updated = await disconnectIntegration(integrationId);
            setIntegrations((prev) => prev.map((i) => (i.id === integrationId ? updated : i)));
        } catch (error) {
            console.error("Failed to disconnect:", error);
        }
    };

    const handleTest = async (integrationId: string) => {
        setIsTesting(integrationId);
        setTestResult(null);
        try {
            const result = await testIntegration(integrationId);
            setTestResult(result);
        } catch (error) {
            setTestResult({ success: false, message: "Test failed" });
        } finally {
            setTimeout(() => setIsTesting(null), 500);
        }
    };

    const copyWebhookUrl = (platform: string) => {
        const url = `${window.location.origin}/api/webhooks/ingest?platform=${platform}`;
        navigator.clipboard.writeText(url);
        setCopiedWebhook(true);
        setTimeout(() => setCopiedWebhook(false), 2000);
    };

    if (isLoading) {
        return <div className="p-8 text-center text-zinc-400 animate-pulse">Loading settings...</div>;
    }

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
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
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
                    {/* ========== PROFILE TAB ========== */}
                    {activeTab === "profile" && (
                        <div className="glass-card-static p-6 space-y-6">
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                Business Profile
                            </h2>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                                    <Building2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{formData.businessName || "Your Business"}</p>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>{formData.industry || "Industry"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { label: "Business Name", key: "businessName" },
                                    { label: "Industry", key: "industry" },
                                    { label: "Team Size", key: "teamSize" },
                                    { label: "Business Hours", key: "businessHours" },
                                ].map((f) => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{f.label}</label>
                                        <input
                                            type="text"
                                            value={(formData as any)[f.key]}
                                            onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-200"
                                            style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Owner Name</label>
                                    <input type="text" value={`${profile?.firstName || ""} ${profile?.lastName || ""}`.trim()} disabled className="w-full px-4 py-2.5 rounded-xl text-sm outline-none opacity-50" style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email</label>
                                    <input type="email" value={profile?.email || ""} disabled className="w-full px-4 py-2.5 rounded-xl text-sm outline-none opacity-50" style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }} />
                                </div>
                            </div>
                            <button onClick={handleSaveProfile} disabled={isSaving} className="btn-primary flex items-center justify-center gap-2" style={{ padding: "10px 24px", fontSize: "0.85rem", opacity: isSaving ? 0.7 : 1 }}>
                                {isSaving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    )}

                    {/* ========== INTEGRATIONS TAB ========== */}
                    {activeTab === "integrations" && (
                        <div className="glass-card-static p-6 space-y-6">
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                Connected Integrations
                            </h2>

                            <div className="space-y-3">
                                {integrations.map((integ) => {
                                    const meta = platformMeta[integ.platform];
                                    if (!meta) return null;
                                    const IconComp = meta.icon;
                                    const isConnected = integ.status === "connected";
                                    const emailMeta = (integ.metadata as any)?.email;
                                    let description = isConnected ? meta.connectedDesc : meta.disconnectedDesc;
                                    if (isConnected && integ.platform === "gmail" && emailMeta) {
                                        description = `OAuth connected — ${emailMeta}`;
                                    }

                                    return (
                                        <div
                                            key={integ.id}
                                            className="flex items-center justify-between p-4 rounded-xl"
                                            style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                    style={{ background: `${meta.color}15` }}
                                                >
                                                    <IconComp className="w-5 h-5" style={{ color: meta.color }} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                        {meta.name}
                                                    </p>
                                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                        {description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {isConnected ? (
                                                    <>
                                                        <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>Connected</span>
                                                        <button
                                                            onClick={() => { setConnectModal(integ.platform); setConnectForm({}); setTestResult(null); }}
                                                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:bg-white/5"
                                                            style={{ color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
                                                        >Configure</button>
                                                        <button
                                                            onClick={() => handleDisconnect(integ.id)}
                                                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:bg-red-500/10"
                                                            style={{ color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                                                        >Disconnect</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-[10px] px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider" style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>Disconnected</span>
                                                        <button
                                                            onClick={() => { setConnectModal(integ.platform); setConnectForm({}); setTestResult(null); }}
                                                            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-colors hover:bg-blue-500/10"
                                                            style={{ color: "var(--accent-blue)", border: "1px solid rgba(59,130,246,0.2)" }}
                                                        >Connect</button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Test Result Toast */}
                            {testResult && (
                                <div
                                    className="flex items-center gap-3 p-3 rounded-xl text-sm"
                                    style={{
                                        background: testResult.success ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                                        border: `1px solid ${testResult.success ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                                        color: testResult.success ? "#10b981" : "#ef4444",
                                    }}
                                >
                                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    {testResult.message}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ========== NOTIFICATIONS TAB ========== */}
                    {activeTab === "notifications" && (
                        <div className="glass-card-static p-6 space-y-6">
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                                Notification Preferences
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { key: "notifyNewLead" as const, label: "New lead notifications", description: "Get notified when a new lead is captured" },
                                    { key: "notifyHotLead" as const, label: "Hot lead alerts", description: "Instant alert when a lead scores above 80" },
                                    { key: "notifyNegative" as const, label: "Negative sentiment alerts", description: "Alert when customer frustration is detected" },
                                    { key: "notifyFollowUps" as const, label: "Follow-up reminders", description: "Daily digest of pending follow-ups" },
                                    { key: "notifyAppointments" as const, label: "Appointment reminders", description: "1 hour before each meeting" },
                                    { key: "notifyWeeklyReport" as const, label: "Weekly analytics report", description: "Summary of key metrics every Monday" },
                                ].map((notif) => (
                                    <div
                                        key={notif.key}
                                        className="flex items-center justify-between p-4 rounded-xl"
                                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}
                                    >
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{notif.label}</p>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{notif.description}</p>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                const newVal = !notifications[notif.key];
                                                setNotifications((prev) => ({ ...prev, [notif.key]: newVal }));
                                                try { await updateNotificationSettings({ [notif.key]: newVal }); }
                                                catch { setNotifications((prev) => ({ ...prev, [notif.key]: !newVal })); }
                                            }}
                                            className="w-11 h-6 rounded-full relative transition-colors duration-300 flex-shrink-0"
                                            style={{ background: notifications[notif.key] ? "var(--accent-green)" : "var(--bg-tertiary)" }}
                                        >
                                            <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-transform duration-300" style={{ transform: notifications[notif.key] ? "translateX(22px)" : "translateX(4px)" }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ========== SECURITY TAB ========== */}
                    {activeTab === "security" && (
                        <div className="glass-card-static p-6 space-y-6">
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Security Settings</h2>
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

                    {/* ========== APPEARANCE TAB ========== */}
                    {activeTab === "appearance" && (
                        <div className="glass-card-static p-6 space-y-6">
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Appearance</h2>
                            <div>
                                <label className="block text-xs font-medium mb-3" style={{ color: "var(--text-secondary)" }}>Theme</label>
                                <div className="flex items-center gap-3">
                                    {[
                                        { label: "Dark", value: "dark", preview: "var(--bg-primary)" },
                                        { label: "Light", value: "light", preview: "#f8fafc" },
                                        { label: "System", value: "system", preview: "linear-gradient(135deg, var(--bg-primary) 50%, #f8fafc 50%)" },
                                    ].map((theme) => (
                                        <button
                                            key={theme.value}
                                            onClick={async () => {
                                                setSelectedTheme(theme.value);
                                                try { await updateTheme(theme.value); } catch { }
                                            }}
                                            className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200"
                                            style={{
                                                border: `2px solid ${selectedTheme === theme.value ? "var(--accent-blue)" : "var(--border-subtle)"}`,
                                                background: selectedTheme === theme.value ? "rgba(59,130,246,0.05)" : "transparent",
                                            }}
                                        >
                                            <div className="w-16 h-10 rounded-lg" style={{ background: theme.preview }} />
                                            <span className="text-xs font-medium" style={{ color: selectedTheme === theme.value ? "var(--accent-blue)" : "var(--text-muted)" }}>
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

            {/* ========== CONNECT MODAL ========== */}
            {connectModal && platformMeta[connectModal] && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-2xl p-6 space-y-5" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${platformMeta[connectModal].color}15` }}>
                                    {(() => { const I = platformMeta[connectModal].icon; return <I className="w-5 h-5" style={{ color: platformMeta[connectModal].color }} />; })()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Connect {platformMeta[connectModal].name}</h2>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Enter your API credentials below</p>
                                </div>
                            </div>
                            <button onClick={() => setConnectModal(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-3">
                            {platformMeta[connectModal].fields.map((field) => {
                                // Auto-fill webhook URL for website forms
                                const isWebhookAuto = connectModal === "website_forms" && field.key === "webhookUrl";
                                const autoVal = isWebhookAuto ? (typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/ingest?platform=website_forms` : "/api/webhooks/ingest?platform=website_forms") : "";

                                return (
                                    <div key={field.key}>
                                        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{field.label}</label>
                                        <input
                                            type={field.type || "text"}
                                            placeholder={field.placeholder}
                                            value={isWebhookAuto ? autoVal : (connectForm[field.key] || "")}
                                            onChange={(e) => setConnectForm({ ...connectForm, [field.key]: e.target.value })}
                                            readOnly={isWebhookAuto}
                                            className="w-full px-3 py-2.5 rounded-xl text-sm bg-transparent outline-none text-white"
                                            style={{ border: "1px solid var(--border-subtle)", opacity: isWebhookAuto ? 0.6 : 1 }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleConnect(connectModal)}
                                disabled={isConnecting}
                                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                style={{ background: platformMeta[connectModal].color, color: "white", opacity: isConnecting ? 0.7 : 1 }}
                            >
                                {isConnecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</> : <><Zap className="w-4 h-4" /> Connect</>}
                            </button>
                            <button
                                onClick={() => setConnectModal(null)}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium"
                                style={{ color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
