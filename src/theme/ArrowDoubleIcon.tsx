import { SvgIcon } from "@mui/material";

export function ArrowDoubleIcon() {
    return (
        <SvgIcon
            viewBox="0 0 18 8"
            sx={{
                width: 18,
                height: 8,
                opacity: 1,
            }}
        >
            {/* Line */}
            <line
                x1="2"
                y1="4"
                x2="16"
                y2="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            {/* Left arrow head */}
            <polyline
                points="6,1 2,4 6,7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Right arrow head */}
            <polyline
                points="12,1 16,4 12,7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </SvgIcon>
    );
}
