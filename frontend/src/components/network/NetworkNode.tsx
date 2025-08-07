"use client"

import type React from "react"
import {useState, useCallback, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {Trash2, Layers} from "lucide-react"
import type {NetworkNode as NetworkNodeType, ConnectionPoint} from "@/types/network"
import {iconMap} from "@/lib/icons"
import {ConnectionDot} from "./ConnectionDot"

interface NetworkNodeProps {
    node: NetworkNodeType
    selected: boolean
    onSelect: (id: string) => void
    onDelete: (id: string) => void
    onDrag: (id: string, x: number, y: number) => void
    onConnectionStart: (point: ConnectionPoint) => void
    onConnectionEnd: (point: ConnectionPoint) => void
    isConnecting: boolean
    connectingFrom: string | null
}

export const NetworkNode: React.FC<NetworkNodeProps> = ({
                                                            node,
                                                            selected,
                                                            onSelect,
                                                            onDelete,
                                                            onDrag,
                                                            onConnectionStart,
                                                            onConnectionEnd,
                                                            isConnecting,
                                                            connectingFrom,
                                                        }) => {
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({x: 0, y: 0})

    const IconComponent = iconMap[node.iconName] || Layers

    // 计算连接点的绝对位置（画布坐标）
    const inputPoint = {
        x: node.x + node.width / 2,
        y: node.y,
    }
    const outputPoint = {
        x: node.x + node.width / 2,
        y: node.y + node.height,
    }

    // 检查是否可以连接到这个节点
    const canConnectToInput = isConnecting && connectingFrom !== node.id

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!isConnecting) {
            setIsDragging(true)
            setDragStart({
                x: e.clientX - node.x,
                y: e.clientY - node.y,
            })
            onSelect(node.id)
        }
    }

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDragging && !isConnecting) {
                const newX = e.clientX - dragStart.x
                const newY = e.clientY - dragStart.y
                onDrag(node.id, newX, newY)
            }
        },
        [isDragging, dragStart, node.id, onDrag, isConnecting],
    )

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
    }, [])

    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
            return () => {
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)
            }
        }
    }, [isDragging, handleMouseMove, handleMouseUp])

    return (
        <div
            className={`absolute px-4 py-1 shadow-md rounded-lg bg-white border-2 min-w-[140px] select-none group transition-all duration-200 ${
                selected ? "border-blue-500 shadow-lg" : "border-gray-200"
            } ${isDragging ? "z-50 scale-105" : "z-10"} ${!isConnecting ? "cursor-move" : "cursor-default"} ${
                isConnecting && canConnectToInput ? "ring-2 ring-blue-300 ring-opacity-50 shadow-lg" : ""
            }`}
            style={{
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
            }}
            onMouseDown={handleMouseDown}
        >
            <div className="flex items-center gap-2 mb-2">
                <IconComponent className={`w-4 h-4 ${node.color}`}/>
                <div className="font-semibold text-sm">{node.label}</div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto p-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(node.id)
                    }}
                >
                    <Trash2 className="w-3 h-3"/>
                </Button>
            </div>

            {Object.keys(node.params).length > 0 && (
                <div className="text-xs text-gray-600 space-y-1 mb-2">
                    {Object.entries(node.params)
                        .slice(0, 2)
                        .map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span>{key}:</span>
                                <span className="font-mono">{String(value)}</span>
                            </div>
                        ))}
                </div>
            )}

            {/*<div className="flex justify-between items-center text-xs text-gray-500">*/}
            {/*    <span className="truncate">In: {node.inputShape}</span>*/}
            {/*    <span className="truncate">Out: {node.outputShape}</span>*/}
            {/*</div>*/}

            {/* 连接点 */}
            <ConnectionDot
                nodeId={node.id}
                type="input"
                x={inputPoint.x}
                y={inputPoint.y}
                onConnectionStart={onConnectionStart}
                onConnectionEnd={onConnectionEnd}
                isConnecting={isConnecting}
                canConnect={canConnectToInput}
            />
            <ConnectionDot
                nodeId={node.id}
                type="output"
                x={outputPoint.x}
                y={outputPoint.y}
                onConnectionStart={onConnectionStart}
                onConnectionEnd={onConnectionEnd}
                isConnecting={isConnecting}
                canConnect={false}
            />
        </div>
    )
}
