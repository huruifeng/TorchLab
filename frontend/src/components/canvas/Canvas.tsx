"use client"

import type React from "react"
import {useRef, useCallback, useEffect} from "react"
import type {CanvasTransform} from "@/types/canvas"
import TorchLabIcon from "@/components/TorchLabIcon.tsx";
import {Badge} from "@/components/ui/badge"
import {Link, Lock} from "lucide-react"
import type {Connection, NetworkNode} from "@/types/network.ts";

interface CanvasProps {
    transform: CanvasTransform
    isLocked: boolean
    isPanning: boolean
    showGrid: boolean
    onMouseDown: (e: React.MouseEvent) => void
    onMouseMove: (e: React.MouseEvent) => void
    onMouseUp: (e: React.MouseEvent) => void
    onWheel: (e: React.WheelEvent) => void
    onClick: (e: React.MouseEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
    children: React.ReactNode
    svgContent: React.ReactNode // SVG内容
    nodes: NetworkNode[]
    connections: Connection[]
    isConnecting: boolean
}

export const Canvas: React.FC<CanvasProps> = ({
                                                  transform,
                                                  isLocked,
                                                  isPanning,
                                                  showGrid,
                                                  onMouseDown,
                                                  onMouseMove,
                                                  onMouseUp,
                                                  onWheel,
                                                  onClick,
                                                  onDragOver,
                                                  onDrop,
                                                  children,
                                                  svgContent, // SVG内容的props
                                                  nodes,
                                                  connections,
                                                  isConnecting,
                                              }) => {
    const canvasRef = useRef<HTMLDivElement>(null)

    // 阻止默认的拖拽行为
    const handleDragStart = useCallback((e: React.DragEvent) => {
        e.preventDefault()
    }, [])

    // 处理键盘快捷键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target !== document.body) return

            // 空格键 + 鼠标拖拽 = 平移画布
            if (e.code === "Space" && !isLocked) {
                e.preventDefault()
                document.body.style.cursor = "grab"
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === "Space") {
                document.body.style.cursor = "default"
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("keyup", handleKeyUp)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("keyup", handleKeyUp)
            document.body.style.cursor = "default"
        }
    }, [isLocked])

    const canvasStyle: React.CSSProperties = {
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        transformOrigin: "0 0",
        transition: isPanning ? "none" : "transform 0.1s ease-out",
    }

    const containerCursor = isPanning ? "grabbing" : isLocked ? "default" : "grab"

    return (
        <div
            ref={canvasRef}
            className={`w-full h-full relative overflow-hidden ${showGrid ? "bg-grid" : "bg-gray-50"}`}
            style={{
                cursor: containerCursor,
                backgroundImage: showGrid ? "radial-gradient(circle, #cecece 1px, transparent 1px)" : "none",
                backgroundSize: showGrid ? "20px 20px" : "auto",
                backgroundPosition: showGrid ? `${transform.x % 20}px ${transform.y % 20}px` : "0 0",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onWheel={onWheel}
            onClick={onClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragStart={handleDragStart}
        >
            {/* 变换容器 */}
            <div style={canvasStyle}>
                {children}

                 {/* SVG 容器用于连接线 - 在变换容器内部 */}
                <svg className="absolute inset-0"
                    style={{
                        zIndex: 1,
                        pointerEvents: "none",
                        overflow: "visible", // 确保连接线在变换后仍然可见
                    }}
                >
                    {svgContent} {/* SVG内容将通过props传入 */}
                </svg>
            </div>

            {/* 状态面板 */}
            <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
                <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Nodes:</span>
                        <span className="font-medium">{nodes?.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Connections:</span>
                        <span className="font-medium">{connections?.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <Badge variant="outline" className="text-xs">
                            {isConnecting ? "Connecting" : nodes?.length > 0 ? "Ready" : "Empty"}
                        </Badge>
                    </div>
                </div>
            </div>
            {/* 空状态提示 */}
            {nodes?.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                        {/*<Brain className="w-16 h-16 mx-auto mb-4 text-gray-300/>*/}
                        <TorchLabIcon className="w-32 h-32 mx-auto mb-4 text-gray-300"/>
                        <h3 className="text-xl font-medium mb-2">Start Building Your Network</h3>
                        <p className="text-sm">Drag layers from the left panel to begin</p>
                        <p className="text-xs mt-2 text-gray-400">Click on green dots to create connections between
                            layers</p>
                    </div>
                </div>
            )}

            {/* 连接提示 */}
            {isConnecting && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg animate-bounce">
                    <div className="flex items-center gap-2">
                        <Link className="w-4 h-4"/><span className="text-sm font-medium">Release the mouse on a blue input dot to connect</span>
                    </div>
                </div>
            )}

            {/* 锁定指示器 */}
            {isLocked && (
                <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4"/>Locked
                    </div>
                </div>
            )}

            {/* 缩放指示器 */}
            {transform.scale !== 1 && (
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {Math.round(transform.scale * 100)}%
                </div>
            )}
        </div>
    )
}
