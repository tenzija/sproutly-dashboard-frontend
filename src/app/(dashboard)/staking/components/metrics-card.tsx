interface MetricsCardProps {
    label: string
    value: string
    sublabel?: string
}

export default function MetricsCard({ label, value, sublabel }: MetricsCardProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-6 bg-[rgba(137,_137,_137,_0.05)] py-4 px-8 backdrop-blur-[150px] border border-[rgba(255,_255,_255,_0.09)] rounded-2xl'">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">{label}</p>
            <p className="text-2xl font-bold text-foreground mb-2">{value}</p>
            {sublabel && <p className="text-sm text-foreground/50">{sublabel}</p>}
        </div>
    )
}
