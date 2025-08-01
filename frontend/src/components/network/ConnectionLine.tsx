"use client"

import type React from "react"
import {useState} from "react"
import type {Connection} from "@/types/network"

interface ConnectionLineProps {
    connection: Connection
    onDelete: (id: string) => void
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({connection, onDelete}) => {
    const [isHovered, setIsHovered] = useState(false)
    const animationProgress = connection.animationProgress || 1

    // 计算动画路径
    const animatedToX = connection.fromX + (connection.toX - connection.fromX) * animationProgress
    const animatedToY = connection.fromY + (connection.toY - connection.fromY) * animationProgress

    // 计算贝塞尔曲线的控制点
    const controlX = (connection.fromX + animatedToX) / 2
    const controlY = connection.fromY + Math.abs(animatedToY - connection.fromY) * 0.5

    // 计算贝塞尔曲线上的真正中点 (t=0.5)
    // 二次贝塞尔曲线公式: B(t) = (1-t)²*P0 + 2*(1-t)*t*P1 + t²*P2
    // 当 t=0.5 时: B(0.5) = 0.25*P0 + 0.5*P1 + 0.25*P2
    const t = 0.5
    const oneMinusT = 1 - t
    const realMidX = oneMinusT * oneMinusT * connection.fromX + 2 * oneMinusT * t * controlX + t * t * animatedToX
    const realMidY = oneMinusT * oneMinusT * connection.fromY + 2 * oneMinusT * t * controlY + t * t * animatedToY

    const pathData = `M ${connection.fromX} ${connection.fromY} Q ${controlX} ${controlY} ${animatedToX} ${animatedToY}`

    // 颜色方案
    const colors = {
        normal: "#6b7280",
        hover: "#ef4444",
        deleting: "#dfd1d1",
        shadow: "#c7d2fe",
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    const handleClick = () => {
        if (!connection.isDeleting) {
            onDelete(connection.id)
        }
    }

    return (
        <g>
            <defs>
                <marker id={`arrowhead-${connection.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5"
                        orient="auto">
                    <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill={connection.isDeleting ? colors.deleting : isHovered ? colors.hover : colors.normal}
                        className="transition-colors duration-200"
                    />
                </marker>

                {/* 流动动画的渐变 */}
                <linearGradient id={`flow-gradient-${connection.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent"/>
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.6"/>
                    <stop offset="100%" stopColor="transparent"/>
                    <animateTransform
                        attributeName="gradientTransform"
                        type="translate"
                        values="-100 0;100 0;-100 0"
                        dur="2s"
                        repeatCount="indefinite"
                    />
                </linearGradient>
            </defs>

            {/* 主连接线 */}
            <path
                d={pathData}
                stroke={connection.isDeleting ? colors.deleting : isHovered ? colors.hover : colors.normal}
                strokeWidth={isHovered ? "3" : "2"}
                fill="none"
                markerEnd={animationProgress > 0.8 ? `url(#arrowhead-${connection.id})` : "none"}
                className={`cursor-pointer transition-all duration-200 ${connection.isDeleting ? "opacity-50" : "opacity-100"}`}
                style={{
                    pointerEvents: "stroke",
                    strokeDasharray: connection.isAnimating ? "5,5" : "none",
                    strokeDashoffset: connection.isAnimating ? "10" : "0",
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            />

            {/* 流动效果线（仅在非删除状态下显示） */}
            {!connection.isDeleting && animationProgress === 1 && (
                <path
                    d={pathData}
                    stroke={`url(#flow-gradient-${connection.id})`}
                    strokeWidth="2"
                    fill="none"
                    className="pointer-events-none"
                />
            )}

            {/* 连接线中点的删除按钮 */}
            {animationProgress > 0.5 && (
                <circle
                    cx={realMidX}
                    cy={realMidY}
                    r={isHovered ? "10" : "8"}
                    fill={connection.isDeleting ? colors.deleting : "white"}
                    stroke={connection.isDeleting ? colors.deleting : isHovered ? colors.hover : colors.normal}
                    strokeWidth="2"
                    className={`cursor-pointer transition-all duration-200 ${
                        isHovered || connection.isDeleting ? "opacity-100" : "opacity-0"
                    }`}
                    style={{pointerEvents: "all"}}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                />
            )}

            {/* 删除图标 */}
            {(isHovered || connection.isDeleting) && animationProgress > 0.5 && (
                <text
                    x={realMidX}
                    y={realMidY + 3}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill={connection.isDeleting ? colors.deleting : isHovered ? colors.hover : colors.normal}
                    className="pointer-events-none select-none transition-colors duration-200"
                >
                    ×
                </text>
            )}
        </g>
    )
}
