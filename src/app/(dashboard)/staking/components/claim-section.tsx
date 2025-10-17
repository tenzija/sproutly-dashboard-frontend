interface ClaimSectionProps {
    title: string;
    subtitle: string;
    balance?: number | string;
    unit?: string;            // e.g. "$CBY"
    isLoading?: boolean;
}

const formatNum = (v: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(v);

export default function ClaimSection({
    title,
    subtitle,
    balance,
    unit = "$CBY",
    isLoading = false,
}: ClaimSectionProps) {
    return (
        <div className="rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(137,137,137,0.05)] backdrop-blur-[150px] px-8 py-4">
            <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>

            {/* subtitle left, balance right */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm text-foreground/60">{subtitle}</p>

                {isLoading ? (
                    <span className="h-6 w-28 animate-pulse rounded-md bg-white/10" />
                ) : typeof balance !== "undefined" ? (
                    <span className="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-sm text-foreground">
                        {typeof balance === "number" ? formatNum(balance) : balance} {unit}
                    </span>
                ) : null}
            </div>
        </div>
    );
}
