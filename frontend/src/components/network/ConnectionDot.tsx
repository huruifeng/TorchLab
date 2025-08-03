"use client"

import type React from "react"
import {useState} from "react"
import type {ConnectionPoint} from "@/types/network"

interface ConnectionDotProps {
    nodeId: string
    type: "input" | "output"
    x: number
    y: number
    onConnectionStart: (point: ConnectionPoint) => void
    onConnectionEnd: (point: ConnectionPoint) => void
    isConnecting: boolean
    canConnect: boolean
}

export const ConnectionDot: React.FC<ConnectionDotProps> = ({
                                                                nodeId,
                                                                type,
                                                                x,
                                                                y,
                                                                onConnectionStart,
                                                                onConnectionEnd,
                                                                isConnecting,
                                                                canConnect,
                                                            }) => {
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault() // 防止画布拖拽
        if (type === "output" && !isConnecting) {
            onConnectionStart({nodeId, type, x, y})
        }
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        if (type === "input" && isConnecting && canConnect) {
            onConnectionEnd({nodeId, type, x, y})
        }
    }

    const handleMouseEnter = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsHovered(true)
    }

    const handleMouseLeave = (e: React.MouseEvent) => {
        e.stopPropagation()
        setIsHovered(false)
    }

    return (
        <div
            data-connection-dot="true"
            className={`absolute w-3 h-3 rounded-full border-2 border-white cursor-pointer transition-all duration-200 z-20 ${
                type === "input"
                    ? `bg-blue-500 -top-2 left-1/2 transform -translate-x-1/2 ${
                        isConnecting && canConnect ? "scale-150 shadow-lg ring-2 ring-blue-300 ring-opacity-50" : ""
                    } ${isHovered ? "scale-125" : ""}`
                    : `bg-green-500 -bottom-2 left-1/2 transform -translate-x-1/2 ${
                        !isConnecting && isHovered ? "scale-125 shadow-md" : ""
                    }`
            } ${isConnecting && type === "input" && canConnect ? "bg-blue-400 animate-pulse" : ""}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            title={type === "input" ? "Input connection point" : "Output connection point"}
            style={{pointerEvents: "all"}} // 确保可以接收鼠标事件
        />
    )
}
