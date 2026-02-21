"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    Briefcase,
    Users,
    ArrowRight,
    ArrowLeft,
    MessageSquare,
    Instagram,
    Mail,
    Calendar,
    Globe,
    Check,
    Sparkles,
    Loader2,
    Zap,
    ChevronRight,
} from "lucide-react";
import { completeOnboarding } from "@/actions/onboarding";

const steps = [
    { id: 1, title: "Business Info", icon: Building2 },
    { id: 2, title: "Connect Channels", icon: Zap },
    { id: 3, title: "You're All Set", icon: Sparkles },
];

const channelConfig = [
    {
        key: "whatsapp",
        name: "WhatsApp Business",
        icon: MessageSquare,
        color: "#25D366",
        description: "Auto-capture leads from WhatsApp inquiries",
        fields: [
            { key: "apiKey", label: "Meta Cloud API Token", placeholder: "EAAxxxxxxx..." },
            { key: "phoneNumberId", label: "Phone Number ID", placeholder: "107xxxxx" },
        ],
    },
    {
        key: "instagram",
        name: "Instagram DMs",
        icon: Instagram,
        color: "#E4405F",
        description: "Capture leads from Instagram DM inquiries",
        fields: [
            { key: "apiKey", label: "Access Token", placeholder: "IGQVJxxxxxxx..." },
            { key: "igUserId", label: "Instagram User ID", placeholder: "17841xxxxx" },
        ],
    },
    {
        key: "gmail",
        name: "Gmail",
        icon: Mail,
        color: "#EA4335",
        description: "Capture email inquiries and send outreach",
        fields: [
            { key: "apiKey", label: "OAuth Refresh Token", placeholder: "1//0xxxxxxx..." },
            { key: "email", label: "Gmail Address", placeholder: "you@business.com" },
        ],
    },
    {
        key: "calendar",
        name: "Google Calendar",
        icon: Calendar,
        color: "#4285F4",
        description: "Auto-sync appointments and availability",
        fields: [
            { key: "apiKey", label: "OAuth Refresh Token", placeholder: "1//0xxxxxxx..." },
            { key: "calendarId", label: "Calendar ID", placeholder: "primary" },
        ],
    },
    {
        key: "website_forms",
        name: "Website Forms",
        icon: Globe,
        color: "#06b6d4",
        description: "Capture leads from your website contact forms",
        fields: [],
    },
];

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Step 1 data
    const [businessInfo, setBusinessInfo] = useState({
        businessName: "",
        industry: "",
        teamSize: "",
    });

    // Step 2 data — which channels are expanded and their field values
    const [enabledChannels, setEnabledChannels] = useState<Record<string, boolean>>({});
    const [channelFields, setChannelFields] = useState<Record<string, Record<string, string>>>({});

    const toggleChannel = (key: string) => {
        setEnabledChannels((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const setField = (channelKey: string, fieldKey: string, value: string) => {
        setChannelFields((prev) => ({
            ...prev,
            [channelKey]: { ...(prev[channelKey] || {}), [fieldKey]: value },
        }));
    };

    const handleFinish = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const integrations: any = {};

            if (enabledChannels.whatsapp && channelFields.whatsapp?.apiKey) {
                integrations.whatsapp = {
                    apiKey: channelFields.whatsapp.apiKey,
                    phoneNumberId: channelFields.whatsapp.phoneNumberId || "",
                };
            }
            if (enabledChannels.instagram && channelFields.instagram?.apiKey) {
                integrations.instagram = {
                    apiKey: channelFields.instagram.apiKey,
                    igUserId: channelFields.instagram.igUserId || "",
                };
            }
            if (enabledChannels.gmail && channelFields.gmail?.apiKey) {
                integrations.gmail = {
                    apiKey: channelFields.gmail.apiKey,
                    email: channelFields.gmail.email || "",
                };
            }
            if (enabledChannels.calendar && channelFields.calendar?.apiKey) {
                integrations.calendar = {
                    apiKey: channelFields.calendar.apiKey,
                    calendarId: channelFields.calendar.calendarId || "primary",
                };
            }
            if (enabledChannels.website_forms) {
                integrations.website_forms = true;
            }

            const result = await completeOnboarding({
                businessName: businessInfo.businessName,
                industry: businessInfo.industry,
                teamSize: businessInfo.teamSize,
                integrations,
            });

            if (result?.success) {
                setCurrentStep(3);
            } else {
                setError("Onboarding failed. Please try again.");
            }
        } catch (err: any) {
            console.error("Onboarding error:", err);
            setError(err?.message || "Something went wrong. Check the console for details.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-void)" }}>
            <div className="w-full max-w-2xl">
                {/* Logo + Progress */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>AI Leads</span>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center justify-center gap-3">
                        {steps.map((step, i) => (
                            <div key={step.id} className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                                        style={{
                                            background: currentStep >= step.id ? "var(--gradient-hero)" : "var(--bg-secondary)",
                                            color: currentStep >= step.id ? "white" : "var(--text-muted)",
                                            border: currentStep >= step.id ? "none" : "1px solid var(--border-subtle)",
                                        }}
                                    >
                                        {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                                    </div>
                                    <span
                                        className="text-xs font-medium hidden sm:block"
                                        style={{ color: currentStep >= step.id ? "var(--text-primary)" : "var(--text-muted)" }}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                                {i < steps.length - 1 && (
                                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card */}
                <div className="rounded-2xl p-8" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
                    {/* ===== STEP 1: Business Info ===== */}
                    {currentStep === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="text-center mb-2">
                                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Tell us about your business</h2>
                                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>This helps us customize your lead capture experience</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                                        <Building2 className="w-3.5 h-3.5 inline mr-1" /> Business Name *
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., FitZone Gym"
                                        value={businessInfo.businessName}
                                        onChange={(e) => setBusinessInfo({ ...businessInfo, businessName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                                        <Briefcase className="w-3.5 h-3.5 inline mr-1" /> Industry *
                                    </label>
                                    <select
                                        value={businessInfo.industry}
                                        onChange={(e) => setBusinessInfo({ ...businessInfo, industry: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                                    >
                                        <option value="">Select your industry</option>
                                        <option value="fitness">Fitness & Gym</option>
                                        <option value="salon">Salon & Beauty</option>
                                        <option value="education">Education & Coaching</option>
                                        <option value="realestate">Real Estate</option>
                                        <option value="healthcare">Healthcare</option>
                                        <option value="restaurant">Restaurant & Cafe</option>
                                        <option value="ecommerce">E-commerce</option>
                                        <option value="agency">Marketing Agency</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                                        <Users className="w-3.5 h-3.5 inline mr-1" /> Team Size
                                    </label>
                                    <select
                                        value={businessInfo.teamSize}
                                        onChange={(e) => setBusinessInfo({ ...businessInfo, teamSize: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                                        style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                                    >
                                        <option value="">Select team size</option>
                                        <option value="solo">Just me</option>
                                        <option value="2-5">2-5 people</option>
                                        <option value="6-15">6-15 people</option>
                                        <option value="16-50">16-50 people</option>
                                        <option value="50+">50+ people</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={() => setCurrentStep(2)}
                                disabled={!businessInfo.businessName || !businessInfo.industry}
                                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                style={{
                                    background: "var(--gradient-hero)",
                                    color: "white",
                                    opacity: !businessInfo.businessName || !businessInfo.industry ? 0.5 : 1,
                                }}
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* ===== STEP 2: Connect Channels ===== */}
                    {currentStep === 2 && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="text-center mb-2">
                                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Connect your channels</h2>
                                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                                    Paste your API keys to start capturing leads automatically. You can skip and add later.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {channelConfig.map((ch) => {
                                    const isEnabled = !!enabledChannels[ch.key];
                                    const IconComp = ch.icon;

                                    return (
                                        <div
                                            key={ch.key}
                                            className="rounded-xl overflow-hidden transition-all duration-300"
                                            style={{
                                                border: `1px solid ${isEnabled ? ch.color + "40" : "var(--border-subtle)"}`,
                                                background: isEnabled ? `${ch.color}05` : "var(--bg-primary)",
                                            }}
                                        >
                                            {/* Channel toggle header */}
                                            <button
                                                onClick={() => toggleChannel(ch.key)}
                                                className="w-full flex items-center gap-3 p-4 text-left"
                                            >
                                                <div
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ background: `${ch.color}15` }}
                                                >
                                                    <IconComp className="w-4 h-4" style={{ color: ch.color }} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{ch.name}</p>
                                                    <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{ch.description}</p>
                                                </div>
                                                <div
                                                    className="w-10 h-5 rounded-full flex items-center transition-all duration-300 flex-shrink-0"
                                                    style={{
                                                        background: isEnabled ? ch.color : "var(--border-subtle)",
                                                        justifyContent: isEnabled ? "flex-end" : "flex-start",
                                                        padding: "2px",
                                                    }}
                                                >
                                                    <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300" />
                                                </div>
                                            </button>

                                            {/* Expanded fields */}
                                            {isEnabled && ch.fields.length > 0 && (
                                                <div className="px-4 pb-4 space-y-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                                                    <div className="pt-3 space-y-3">
                                                        {ch.fields.map((field) => (
                                                            <div key={field.key}>
                                                                <label className="block text-xs font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                                                                    {field.label}
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder={field.placeholder}
                                                                    value={channelFields[ch.key]?.[field.key] || ""}
                                                                    onChange={(e) => setField(ch.key, field.key, e.target.value)}
                                                                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none font-mono"
                                                                    style={{
                                                                        background: "var(--bg-secondary)",
                                                                        border: "1px solid var(--border-subtle)",
                                                                        color: "var(--text-primary)",
                                                                        fontSize: "0.8rem",
                                                                    }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Website forms — show webhook URL when enabled */}
                                            {isEnabled && ch.key === "website_forms" && (
                                                <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                                                    <div className="pt-3">
                                                        <p className="text-xs mb-1.5" style={{ color: "var(--text-secondary)" }}>Your Webhook URL (auto-generated)</p>
                                                        <code className="block px-3 py-2 rounded-lg text-xs font-mono truncate" style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}>
                                                            {typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/ingest?platform=website_forms` : "/api/webhooks/ingest?platform=website_forms"}
                                                        </code>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setCurrentStep(1)}
                                    className="px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
                                    style={{ color: "var(--text-muted)", border: "1px solid var(--border-subtle)" }}
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    onClick={handleFinish}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                                    style={{ background: "var(--gradient-hero)", color: "white", opacity: isSubmitting ? 0.6 : 1 }}
                                >
                                    {isSubmitting ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Setting up...</>
                                    ) : (
                                        <><Zap className="w-4 h-4" /> Finish Setup</>
                                    )}
                                </button>
                            </div>

                            <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
                                You can skip channels and add them later from Settings
                            </p>

                            {error && (
                                <div className="p-3 rounded-xl text-sm" style={{ background: "#ef444415", border: "1px solid #ef444440", color: "#ef4444" }}>
                                    ⚠️ {error}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ===== STEP 3: Done ===== */}
                    {currentStep === 3 && (
                        <div className="space-y-6 animate-fade-in text-center py-4">
                            <div className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
                                <Check className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>You&apos;re all set! 🎉</h2>
                                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                    <strong>{businessInfo.businessName}</strong> is ready to capture leads automatically.
                                    {Object.values(enabledChannels).filter(Boolean).length > 0 && (
                                        <> You connected <strong>{Object.values(enabledChannels).filter(Boolean).length} channel{Object.values(enabledChannels).filter(Boolean).length > 1 ? "s" : ""}</strong>.</>
                                    )}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: "Leads", value: "Auto-capture", icon: "📥" },
                                    { label: "AI Responses", value: "Enabled", icon: "🤖" },
                                    { label: "Automations", value: "3 active", icon: "⚡" },
                                ].map((item) => (
                                    <div key={item.label} className="p-3 rounded-xl" style={{ background: "var(--bg-primary)", border: "1px solid var(--border-subtle)" }}>
                                        <p className="text-xl mb-1">{item.icon}</p>
                                        <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>{item.label}</p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                                style={{ background: "var(--gradient-hero)", color: "white" }}
                            >
                                Go to Dashboard <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
