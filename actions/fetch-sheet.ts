"use server";

export async function fetchPublicSheetCsv(sheetUrl: string) {
    if (!sheetUrl) return { success: false, data: [] };

    try {
        let csvUrl = sheetUrl;

        // Transform the standard Google Sheet URL to the CSV export URL
        if (sheetUrl.includes("/edit")) {
            const match = sheetUrl.match(/\/d\/(.*?)(\/|$)/);
            if (match && match[1]) {
                const sheetId = match[1];
                // Need to specify gid if provided, but typically the first sheet is exported.
                csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
            }
        } else if (sheetUrl.includes("/pubhtml")) {
            // Transform Published to Web URL
            csvUrl = sheetUrl.replace("/pubhtml", "/pub?output=csv");
        }

        // Fetching from server-side bypasses browser CORS restrictions
        const res = await fetch(csvUrl, {
            cache: "no-store"
        });

        if (!res.ok) {
            const text = await res.text();
            if (text.includes("Sign in")) {
                throw new Error("Sheet is private. Please share it as 'Accessible to anyone with the link'.");
            }
            throw new Error(`Failed to fetch sheet (Status ${res.status}). Ensure it is "Accessible to anyone with the link" and has data.`);
        }

        const csvText = await res.text();
        const data = parseCsv(csvText);

        return { success: true, data };
    } catch (e: any) {
        return { success: false, error: e.message || "Failed to fetch spreadsheet data." };
    }
}

// A simple CSV parser that respects commas inside double quotes
function parseCsv(text: string) {
    // Split by universal newline
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
    if (lines.length === 0) return [];

    // Regex to split by comma, but ignore commas inside quotes
    const splitRegex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

    const headers = lines[0].split(splitRegex).map(h => h.replace(/^"|"$/g, '').trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        // Handle empty lines gracefully
        if (!lines[i].trim()) continue;

        const values = lines[i].split(splitRegex).map(v => v.replace(/^"|"$/g, '').trim());
        const row: Record<string, string> = {};

        // Map values to headers
        for (let j = 0; j < headers.length; j++) {
            const headerName = headers[j] || `Col${j}`;
            row[headerName] = values[j] || "";
        }
        data.push(row);
    }

    return data;
}
