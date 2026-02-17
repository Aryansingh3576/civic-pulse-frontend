// components/ui/separator.tsx — Divider line
import { cn } from "@/lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
    ref?: React.Ref<HTMLDivElement>;
}

export function Separator({
    className,
    orientation = "horizontal",
    decorative = true,
    ref,
    ...props
}: SeparatorProps) {
    return (
        <div
            ref={ref}
            role={decorative ? "none" : "separator"}
            aria-orientation={!decorative ? orientation : undefined}
            className={cn(
                "shrink-0 bg-border",
                orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
                className
            )}
            {...props}
        />
    );
}
