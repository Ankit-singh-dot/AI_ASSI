"use server";



export async function sendWhatsAppText(
    apiKey: string,
    phoneNumberId: string,
    to: string,
    text: string
) {
    const res = await fetch(
        `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "text",
                text: { body: text },
            }),
        }
    );

    const resBody = await res.text();
    let data: any = {};
    try { data = JSON.parse(resBody); } catch { }
    if (!res.ok) {
        console.error("WhatsApp Send Error:", data || resBody);
        throw new Error(data?.error?.message || resBody || "WhatsApp API rejected the message.");
    }
    return data;
}


export async function sendWhatsAppButtons(
    apiKey: string,
    phoneNumberId: string,
    to: string,
    bodyText: string,
    buttons: { id: string; title: string }[]
) {
    const res = await fetch(
        `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to,
                type: "interactive",
                interactive: {
                    type: "button",
                    body: { text: bodyText },
                    action: {
                        buttons: buttons.map((btn) => ({
                            type: "reply",
                            reply: { id: btn.id, title: btn.title },
                        })),
                    },
                },
            }),
        }
    );

    const resBody = await res.text();
    let data: any = {};
    try { data = JSON.parse(resBody); } catch { }
    if (!res.ok) {
        console.error("WhatsApp Button Send Error:", data || resBody);
        throw new Error(data?.error?.message || resBody || "WhatsApp API rejected the button message.");
    }
    return data;
}
