import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex h-full w-full items-center justify-center p-8 bg-[#0E0E0E]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-white/50 tracking-wide">Loading...</p>
            </div>
        </div>
    );
}
