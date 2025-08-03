"use client"

import type React from "react"
import {useRef, useCallback, useEffect} from "react"
import type {CanvasTransform} from "@/types/canvas"

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

            {/* 缩放指示器 */}
            {transform.scale !== 1 && (
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {Math.round(transform.scale * 100)}%
                </div>
            )}
        </div>
    )
}
