import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, CircleDot, TrendingUp } from "lucide-react";

export default function StatusBadge({ status }: { status: string }) {
    const s = status?.toLowerCase() || "submitted";

    if (s === "resolved" || s === "closed") {
        return (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 backdrop-blur-md gap-1.5 pr-3 py-1">
                <CheckCircle2 className="size-3.5" /> Resolved
            </Badge>
        );
    }

    if (s === "in_progress") {
        return (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 backdrop-blur-md gap-1.5 pr-3 py-1">
                <Clock className="size-3.5" /> In Progress
            </Badge>
        );
    }

    if (s === "escalated") {
        return (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 backdrop-blur-md gap-1.5 pr-3 py-1">
                <TrendingUp className="size-3.5" /> Escalated
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 backdrop-blur-md gap-1.5 pr-3 py-1">
            <CircleDot className="size-3.5" /> Pending
        </Badge>
    );
}
