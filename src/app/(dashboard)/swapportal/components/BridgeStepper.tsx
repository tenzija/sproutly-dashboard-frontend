import React, { useLayoutEffect, useRef, useState } from "react";

export const BridgeStepper: React.FC<{ progress: string }> = ({ progress }) => {
    const steps = [
        "Approve (if needed)",
        "Quote fee",
        "Send on Polygon",
        "Finalize on Base",
        "Complete",
    ];
    const N = steps.length;

    // map progress -> active index
    const active = (() => {
        switch (progress) {
            case "approving": return 0;
            case "approved":
            case "quoting": return 1;
            case "sending":
            case "sent": return 2;
            case "waitingBase": return 3;
            case "done": return 4;
            default: return -1;
        }
    })();

    // visual tuning
    const GUTTER_PX = 16;   // inset so nothing hugs the card edge
    const LINE_H = 2;    // rail thickness
    const DOT = 10;   // dot diameter (match your CSS)
    const DOT_R = DOT / 2;

    // measure first/last dot centers, then draw rail from inner edge to inner edge
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const firstRef = useRef<HTMLDivElement | null>(null);
    const lastRef = useRef<HTMLDivElement | null>(null);
    const [rail, setRail] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

    useLayoutEffect(() => {
        const update = () => {
            const wrap = wrapRef.current, a = firstRef.current, b = lastRef.current;
            if (!wrap || !a || !b) return;

            const wrapRect = wrap.getBoundingClientRect();
            const aRect = a.getBoundingClientRect();
            const bRect = b.getBoundingClientRect();

            const aCenter = aRect.left + aRect.width / 2;
            const bCenter = bRect.left + bRect.width / 2;

            // ⬅️ start at the right edge of the first dot; ➡️ end at the left edge of the last dot
            const start = aCenter + DOT_R;
            const end = bCenter - DOT_R;

            setRail({ left: start - wrapRect.left, width: Math.max(0, end - start) });
        };

        update();
        const ro = new ResizeObserver(update);
        if (wrapRef.current) ro.observe(wrapRef.current);
        window.addEventListener("resize", update);
        return () => { ro.disconnect(); window.removeEventListener("resize", update); };
    }, [N, DOT_R]);

    // fill is a fraction of the measured rail width
    const k = Math.max(0, Math.min(active, N - 1));
    const fillW = N > 1 ? (rail.width * k) / (N - 1) : 0;

    return (
        <div ref={wrapRef} className="w-full" style={{ paddingLeft: GUTTER_PX, paddingRight: GUTTER_PX }}>
            {/* rail + fill + dots */}
            <div className="relative h-6">
                {/* base rail (edge-to-edge) */}
                <div
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{
                        left: rail.left,
                        width: rail.width,
                        height: LINE_H,
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: LINE_H / 2,
                    }}
                />
                {/* filled portion */}
                <div
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{
                        left: rail.left,
                        width: fillW,
                        height: LINE_H,
                        background: "#9FE870",
                        borderRadius: LINE_H / 2,
                        // keep glow subtle to avoid visual overshoot
                        boxShadow: fillW > 0 ? "0 0 4px #9FE870" : "none",
                        transition: "width 180ms ease",
                    }}
                />

                {/* dots (even spacing) */}
                <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${N}, minmax(0,1fr))` }}>
                    {steps.map((_, i) => {
                        const reached = i <= active;
                        const ref = i === 0 ? firstRef : i === N - 1 ? lastRef : undefined;
                        return (
                            <div key={i} ref={ref} className="relative">
                                <span
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                                    style={{
                                        width: DOT,
                                        height: DOT,
                                        background: reached ? "#9FE870" : "rgba(255,255,255,0.3)",
                                        boxShadow: reached ? "0 0 8px #9FE870" : "none",
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* labels */}
            <div className="mt-2 grid text-xs text-white/70" style={{ gridTemplateColumns: `repeat(${N}, minmax(0,1fr))` }}>
                {steps.map((label, i) => (
                    <div
                        key={label}
                        className={[
                            "truncate",
                            i === 0 ? "text-left" : i === N - 1 ? "text-right" : "text-center",
                            i <= active ? "text-[#9FE870]" : "",
                        ].join(" ")}
                        title={label}
                    >
                        {label}
                    </div>
                ))}
            </div>
        </div>
    );
};
