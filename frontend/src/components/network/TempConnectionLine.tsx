import type React from "react"

interface TempConnectionLineProps {
    from: { x: number; y: number }
    to: { x: number; y: number }
}

export const TempConnectionLine: React.FC<TempConnectionLineProps> = ({from, to}) => {
    const midX = (from.x + to.x) / 2
    const controlY = from.y + Math.abs(to.y - from.y) * 0.5

    return (
        <g>
            <defs>
                <linearGradient id="temp-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3"/>
                    <animateTransform
                        attributeName="gradientTransform"
                        type="translate"
                        values="-50 0;50 0;-50 0"
                        dur="1s"
                        repeatCount="indefinite"
                    />
                </linearGradient>
            </defs>

            <path
                d={`M ${from.x} ${from.y} Q ${midX} ${controlY} ${to.x} ${to.y}`}
                stroke="url(#temp-gradient)"
                strokeWidth="3"
                strokeDasharray="8,4"
                fill="none"
                style={{pointerEvents: "none"}}
                className="animate-pulse"
            />
        </g>
    )
}
