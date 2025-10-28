export default function Logo({ className = "h-10" }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 200 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Code brackets */}
            <path
                d="M15 10L5 30L15 50"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M35 10L45 30L35 50"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            
            {/* Sync arrows */}
            <circle cx="25" cy="20" r="2" fill="#22c55e" />
            <circle cx="25" cy="30" r="2" fill="#22c55e" />
            <circle cx="25" cy="40" r="2" fill="#22c55e" />
            
            {/* Text: Code Sync */}
            <text
                x="55"
                y="38"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="28"
                fontWeight="700"
                fill="#ffffff"
            >
                Code Sync
            </text>
        </svg>
    )
}
