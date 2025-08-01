"use client"

import React, {type ElementType} from "react"
import {useCallback, useRef, useState, useEffect} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Play, Save, Zap, Layers, Brain, RotateCcw, Settings, Code, Eye, EyeOff, Trash2, Link, Home} from "lucide-react"
import TorchLabIcon from "@/components/TorchLabIcon.tsx";

// 节点接口定义
interface NetworkNode {
    id: string
    type: string
    label: string
    x: number
    y: number
    width: number
    height: number
    iconName: string
    color: string
    params: Record<string, unknown>
    inputShape: string
    outputShape: string
}

// 连接接口定义
interface Connection {
    id: string
    from: string
    to: string
    fromX: number
    fromY: number
    toX: number
    toY: number
    isAnimating?: boolean
    isDeleting?: boolean
    animationProgress?: number
}

// 连接点接口
interface ConnectionPoint {
    nodeId: string
    type: "input" | "output"
    x: number
    y: number
}

// 图标映射
const iconMap: Record<string, ElementType> = {Layers, Brain, Zap, Settings,}

// 连接点组件
const ConnectionDot = ({nodeId, type, x, y, onConnectionStart, onConnectionEnd, isConnecting, canConnect}: {
    nodeId: string
    type: "input" | "output"
    x: number
    y: number
    onConnectionStart: (point: ConnectionPoint) => void
    onConnectionEnd: (point: ConnectionPoint) => void
    isConnecting: boolean
    canConnect: boolean
}) => {
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (type === "output" && !isConnecting) {
            onConnectionStart({nodeId, type, x, y})
        }
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        e.stopPropagation()
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
        <div className={`absolute w-3 h-3 rounded-full border-2 border-white cursor-pointer transition-all duration-200 ${
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
        />
    )
}

// 自定义节点组件
const LayerNode = ({
                       node,
                       selected,
                       onSelect,
                       onDelete,
                       onDrag,
                       onConnectionStart,
                       onConnectionEnd,
                       isConnecting,
                       connectingFrom,
                   }: {
    node: NetworkNode
    selected: boolean
    onSelect: (id: string) => void
    onDelete: (id: string) => void
    onDrag: (id: string, x: number, y: number) => void
    onConnectionStart: (point: ConnectionPoint) => void
    onConnectionEnd: (point: ConnectionPoint) => void
    isConnecting: boolean
    connectingFrom: string | null
}) => {
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({x: 0, y: 0})

    const IconComponent = iconMap[node.iconName] || Layers

    // 计算连接点的绝对位置
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
        <div className={`absolute px-4 py-3 shadow-md rounded-lg bg-white border-2 min-w-[150px] select-none group transition-all duration-200 ${selected ? "border-blue-500 shadow-lg" : "border-gray-200"
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

            <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="truncate">In: {node.inputShape}</span>
                <span className="truncate">Out: {node.outputShape}</span>
            </div>

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

// 连接线组件
const ConnectionLine = ({
                            connection,
                            onDelete,
                        }: {
    connection: Connection
    onDelete: (id: string) => void
}) => {
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
    normal: "#6b7280", //or, indigo-500
    hover: "#ef4444", //or, indigo-600
    deleting: "#dfd1d1", //or, red-500
    shadow: "#c7d2fe", //or, indigo-200
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
                <marker id={`arrowhead-${connection.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
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
                    className={`cursor-pointer transition-all duration-200 ${isHovered || connection.isDeleting ? "opacity-100" : "opacity-0"}`}
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

// 临时连接线组件（拖拽时显示）
const TempConnectionLine = ({from, to,}: {
    from: { x: number; y: number }
    to: { x: number; y: number }
}) => {
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

// 预定义的层类型
const layerTypes = [
    {
        category: "Input Layers",
        layers: [
            {
                type: "Input",
                label: "Input Layer",
                iconName: "Layers",
                color: "text-blue-600",
                params: {shape: "[batch, 784]"},
                inputShape: "None",
                outputShape: "[batch, 784]",
            },
        ],
    },
    {
        category: "Dense Layers",
        layers: [
            {
                type: "Linear",
                label: "Linear",
                iconName: "Brain",
                color: "text-purple-600",
                params: {in_features: 784, out_features: 128},
                inputShape: "[batch, 784]",
                outputShape: "[batch, 128]",
            },
            {
                type: "Dropout",
                label: "Dropout",
                iconName: "Layers",
                color: "text-orange-600",
                params: {p: 0.5},
                inputShape: "[batch, N]",
                outputShape: "[batch, N]",
            },
        ],
    },
    {
        category: "Convolutional Layers",
        layers: [
            {
                type: "Conv2d",
                label: "Conv2D",
                iconName: "Layers",
                color: "text-green-600",
                params: {in_channels: 3, out_channels: 64, kernel_size: 3},
                inputShape: "[batch, 3, H, W]",
                outputShape: "[batch, 64, H, W]",
            },
            {
                type: "MaxPool2d",
                label: "MaxPool2D",
                iconName: "Layers",
                color: "text-cyan-600",
                params: {kernel_size: 2, stride: 2},
                inputShape: "[batch, C, H, W]",
                outputShape: "[batch, C, H/2, W/2]",
            },
        ],
    },
    {
        category: "Activation Functions",
        layers: [
            {
                type: "ReLU",
                label: "ReLU",
                iconName: "Zap",
                color: "text-red-600",
                params: {},
                inputShape: "[batch, N]",
                outputShape: "[batch, N]",
            },
            {
                type: "Sigmoid",
                label: "Sigmoid",
                iconName: "Zap",
                color: "text-pink-600",
                params: {},
                inputShape: "[batch, N]",
                outputShape: "[batch, N]",
            },
            {
                type: "Softmax",
                label: "Softmax",
                iconName: "Zap",
                color: "text-indigo-600",
                params: {dim: 1},
                inputShape: "[batch, N]",
                outputShape: "[batch, N]",
            },
        ],
    },
]

export default function NetworkEditor() {
    const canvasRef = useRef<HTMLDivElement>(null)
      // 预设一些节点来展示连接线效果
  const [nodes, setNodes] = useState<NetworkNode[]>([
    {
      id: "input-demo",
      type: "Input",
      label: "Input Layer",
      x: 100,
      y: 100,
      width: 150,
      height: 100,
      iconName: "Layers",
      color: "text-blue-600",
      params: { shape: "[batch, 784]" },
      inputShape: "None",
      outputShape: "[batch, 784]",
    },
    {
      id: "linear1-demo",
      type: "Linear",
      label: "Linear",
      x: 350,
      y: 80,
      width: 150,
      height: 100,
      iconName: "Brain",
      color: "text-purple-600",
      params: { in_features: 784, out_features: 256 },
      inputShape: "[batch, 784]",
      outputShape: "[batch, 256]",
    },
    {
      id: "relu1-demo",
      type: "ReLU",
      label: "ReLU",
      x: 600,
      y: 100,
      width: 150,
      height: 100,
      iconName: "Zap",
      color: "text-red-600",
      params: {},
      inputShape: "[batch, 256]",
      outputShape: "[batch, 256]",
    },
    {
      id: "dropout-demo",
      type: "Dropout",
      label: "Dropout",
      x: 350,
      y: 250,
      width: 150,
      height: 100,
      iconName: "Layers",
      color: "text-orange-600",
      params: { p: 0.3 },
      inputShape: "[batch, 256]",
      outputShape: "[batch, 256]",
    },
    {
      id: "linear2-demo",
      type: "Linear",
      label: "Linear",
      x: 600,
      y: 280,
      width: 150,
      height: 100,
      iconName: "Brain",
      color: "text-purple-600",
      params: { in_features: 256, out_features: 128 },
      inputShape: "[batch, 256]",
      outputShape: "[batch, 128]",
    },
    {
      id: "softmax-demo",
      type: "Softmax",
      label: "Softmax",
      x: 850,
      y: 200,
      width: 150,
      height: 100,
      iconName: "Zap",
      color: "text-indigo-600",
      params: { dim: 1 },
      inputShape: "[batch, 128]",
      outputShape: "[batch, 128]",
    },
  ])

  // 预设一些连接来展示视觉效果
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "conn-1",
      from: "input-demo",
      to: "linear1-demo",
      fromX: 175, // input center x + width/2
      fromY: 200, // input y + height
      toX: 425, // linear1 center x + width/2
      toY: 80, // linear1 y (top)
      animationProgress: 1,
    },
    {
      id: "conn-2",
      from: "linear1-demo",
      to: "relu1-demo",
      fromX: 425,
      fromY: 180,
      toX: 675,
      toY: 100,
      animationProgress: 1,
    },
    {
      id: "conn-3",
      from: "linear1-demo",
      to: "dropout-demo",
      fromX: 425,
      fromY: 180,
      toX: 425,
      toY: 250,
      animationProgress: 1,
    },
    {
      id: "conn-4",
      from: "relu1-demo",
      to: "linear2-demo",
      fromX: 675,
      fromY: 200,
      toX: 675,
      toY: 280,
      animationProgress: 1,
    },
    {
      id: "conn-5",
      from: "dropout-demo",
      to: "linear2-demo",
      fromX: 425,
      fromY: 350,
      toX: 675,
      toY: 280,
      animationProgress: 1,
    },
    {
      id: "conn-6",
      from: "linear2-demo",
      to: "softmax-demo",
      fromX: 675,
      fromY: 380,
      toX: 925,
      toY: 200,
      animationProgress: 1,
    },
  ])
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [showGrid, setShowGrid] = useState(true)

    // 连接状态
    const [isConnecting, setIsConnecting] = useState(false)
    const [connectingFrom, setConnectingFrom] = useState<ConnectionPoint | null>(null)
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

    // 动画连接创建
    const animateConnectionCreation = useCallback((connection: Connection) => {
        const duration = 500 // 动画持续时间
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            // 使用缓动函数
            const easeOutCubic = 1 - Math.pow(1 - progress, 3)

            setConnections((prev) =>
                prev.map((conn) =>
                    conn.id === connection.id ? {...conn, isAnimating: true, animationProgress: easeOutCubic} : conn,
                ),
            )

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                // 动画完成，移除动画状态
                setConnections((prev) =>
                    prev.map((conn) =>
                        conn.id === connection.id ? {...conn, isAnimating: false, animationProgress: 1} : conn,
                    ),
                )
            }
        }

        requestAnimationFrame(animate)
    }, [])

    // 动画连接删除
    const animateConnectionDeletion = useCallback((connectionId: string) => {
        const duration = 300 // 删除动画持续时间
        const startTime = Date.now()

        // 标记为删除状态
        setConnections((prev) => prev.map((conn) => (conn.id === connectionId ? {...conn, isDeleting: true} : conn)))

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            // 反向动画
            const reverseProgress = 1 - progress

            setConnections((prev) =>
                prev.map((conn) => (conn.id === connectionId ? {...conn, animationProgress: reverseProgress} : conn)),
            )

            if (progress < 1) {
                requestAnimationFrame(animate)
            } else {
                // 动画完成，删除连接
                setConnections((prev) => prev.filter((conn) => conn.id !== connectionId))
            }
        }

        requestAnimationFrame(animate)
    }, [])

    const onDragStart = (event: React.DragEvent, layerData: any) => {
        event.dataTransfer.setData("application/json", JSON.stringify(layerData))
        event.dataTransfer.effectAllowed = "move"
    }

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
    }, [])

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault()

        const canvasBounds = canvasRef.current?.getBoundingClientRect()
        if (!canvasBounds) return

        const layerData = JSON.parse(event.dataTransfer.getData("application/json"))

        const x = event.clientX - canvasBounds.left - 75 // Center the node
        const y = event.clientY - canvasBounds.top - 50

        const newNode: NetworkNode = {
            id: `${layerData.type}-${Date.now()}`,
            type: layerData.type,
            label: layerData.label,
            x,
            y,
            width: 150,
            height: 100,
            iconName: layerData.iconName,
            color: layerData.color,
            params: layerData.params,
            inputShape: layerData.inputShape,
            outputShape: layerData.outputShape,
        }

        setNodes((prev) => [...prev, newNode])
    }, [])

    const handleNodeDrag = useCallback((id: string, x: number, y: number) => {
        setNodes((prev) => prev.map((node) => (node.id === id ? {...node, x, y} : node)))

        // Update connections
        setConnections((prev) =>
            prev.map((conn) => {
                if (conn.from === id) {
                    return {
                        ...conn,
                        fromX: x + 75, // Center of node
                        fromY: y + 100, // Bottom of node
                    }
                }
                if (conn.to === id) {
                    return {
                        ...conn,
                        toX: x + 75, // Center of node
                        toY: y, // Top of node
                    }
                }
                return conn
            }),
        )
    }, [])

    const handleNodeSelect = useCallback(
        (id: string) => {
            if (!isConnecting) {
                setSelectedNodeId(id)
            }
        },
        [isConnecting],
    )

    const handleNodeDelete = useCallback(
        (id: string) => {
            // 先删除相关连接（带动画）
            const relatedConnections = connections.filter((conn) => conn.from === id || conn.to === id)
            relatedConnections.forEach((conn) => {
                animateConnectionDeletion(conn.id)
            })

            // 延迟删除节点，让连接删除动画完成
            setTimeout(() => {
                setNodes((prev) => prev.filter((node) => node.id !== id))
                if (selectedNodeId === id) {
                    setSelectedNodeId(null)
                }
            }, 300)
        },
        [selectedNodeId, connections, animateConnectionDeletion],
    )

    // 连接相关处理函数
    const handleConnectionStart = useCallback((point: ConnectionPoint) => {
        setIsConnecting(true)
        setConnectingFrom(point)
    }, [])

    const handleConnectionEnd = useCallback(
        (point: ConnectionPoint) => {
            if (connectingFrom && connectingFrom.nodeId !== point.nodeId) {
                // 检查是否已存在连接
                const existingConnection = connections.find(
                    (conn) => conn.from === connectingFrom.nodeId && conn.to === point.nodeId,
                )

                if (!existingConnection) {
                    const newConnection: Connection = {
                        id: `conn-${Date.now()}`,
                        from: connectingFrom.nodeId,
                        to: point.nodeId,
                        fromX: connectingFrom.x,
                        fromY: connectingFrom.y,
                        toX: point.x,
                        toY: point.y,
                        isAnimating: true,
                        animationProgress: 0,
                    }

                    setConnections((prev) => [...prev, newConnection])

                    // 启动创建动画
                    animateConnectionCreation(newConnection)
                }
            }

            setIsConnecting(false)
            setConnectingFrom(null)
        },
        [connectingFrom, connections, animateConnectionCreation],
    )

    const handleConnectionDelete = useCallback(
        (connectionId: string) => {
            animateConnectionDeletion(connectionId)
        },
        [animateConnectionDeletion],
    )

    // 鼠标移动处理（用于临时连接线）
    const handleMouseMove = useCallback(
        (e: React.MouseEvent) => {
            if (isConnecting && canvasRef.current) {
                const canvasBounds = canvasRef.current.getBoundingClientRect()
                setMousePosition({
                    x: e.clientX - canvasBounds.left,
                    y: e.clientY - canvasBounds.top,
                })
            }
        },
        [isConnecting],
    )

    // 点击画布取消连接
    const handleCanvasClick = useCallback(
        (e: React.MouseEvent) => {
            if (isConnecting && e.target === e.currentTarget) {
                setIsConnecting(false)
                setConnectingFrom(null)
            }
        },
        [isConnecting],
    )

    const clearCanvas = () => {
        // 先动画删除所有连接
        connections.forEach((conn) => {
            animateConnectionDeletion(conn.id)
        })

        // 延迟清除节点
        setTimeout(() => {
            setNodes([])
            setSelectedNodeId(null)
            setIsConnecting(false)
            setConnectingFrom(null)
        }, 300)
    }

    const generateCode = () => {
        console.log("Generating PyTorch code...", {nodes, connections})
        // Here you would implement the actual code generation logic
    }

    const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null
    const selectedNodeIcon = selectedNode ? iconMap[selectedNode.iconName] || Layers : null

    return (
        <div className="flex h-screen bg-gray-50">
            {/* 左侧工具栏 */}
            <div className="w-80 min-w-80 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-4">Layer Library</h2>

                    {layerTypes.map((category) => (
                        <div key={category.category} className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">{category.category}</h3>
                            <div className="space-y-2">
                                {category.layers.map((layer) => {
                                    const LayerIcon = iconMap[layer.iconName] || Layers
                                    return (
                                        <Card
                                            key={layer.type}
                                            className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:scale-105"
                                            draggable
                                            onDragStart={(event) => onDragStart(event, layer)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <LayerIcon className={`w-4 h-4 ${layer.color}`}/>
                                                    <span className="font-medium text-sm">{layer.label}</span>
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {layer.inputShape} → {layer.outputShape}
                                                </div>
                                                {Object.keys(layer.params).length > 0 && (
                                                    <div className="mt-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {Object.keys(layer.params).length} params
                                                        </Badge>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 主编辑区域 */}
            <div className="flex-1 flex flex-col">
                {/* 顶部工具栏 */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold">Network Editor</h1>
                            <Badge variant="outline">Untitled Model</Badge>
                            {isConnecting && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 animate-pulse">
                                    <Link className="w-3 h-3 mr-1"/>
                                    Connecting...
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
                                <Home className="w-4 h-4 mr-2"/>Back to Home
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
                                {showGrid ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}Grid
                            </Button>
                            <Button variant="outline" size="sm" onClick={clearCanvas}>
                                <RotateCcw className="w-4 h-4 mr-2"/>Clear
                            </Button>
                            <Button variant="outline" size="sm" onClick={generateCode}>
                                <Code className="w-4 h-4 mr-2"/>Generate Code
                            </Button>
                            <Separator orientation="vertical" className="h-6"/>
                            <Button variant="outline" size="sm">
                                <Save className="w-4 h-4 mr-2"/>
                                Save
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                                <Play className="w-4 h-4 mr-2"/>Train Model
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 画布区域 */}
                <div className="flex-1 relative overflow-hidden">
                    <div
                        ref={canvasRef}
                        className={`w-full h-full relative ${showGrid ? "bg-grid" : "bg-gray-50"} ${
                            isConnecting ? "cursor-crosshair" : "cursor-default"
                        }`}
                        onDragOver={onDragOver}
                        onDrop={onDrop}
                        onMouseMove={handleMouseMove}
                        onClick={handleCanvasClick}
                        style={{
                            backgroundImage: showGrid ? "radial-gradient(circle, #cecece 1px, transparent 1px)" : "none",
                            backgroundSize: showGrid ? "20px 20px" : "auto",
                        }}
                    >
                        {/* SVG 容器用于连接线 */}
                        <svg className="absolute inset-0" width="100%" height="100%" style={{zIndex: 1, pointerEvents: "none"}}>
                            {/* 现有连接线 */}
                            {connections.map((connection) => (<ConnectionLine key={connection.id} connection={connection} onDelete={handleConnectionDelete}/>))}
                            {/* 临时连接线 */}
                            {isConnecting && connectingFrom && (<TempConnectionLine from={{x: connectingFrom.x, y: connectingFrom.y}} to={mousePosition}/>)}
                        </svg>

                        {/* 节点 */}
                        {nodes.map((node) => (
                            <LayerNode
                                key={node.id}
                                node={node}
                                selected={selectedNodeId === node.id}
                                onSelect={handleNodeSelect}
                                onDelete={handleNodeDelete}
                                onDrag={handleNodeDrag}
                                onConnectionStart={handleConnectionStart}
                                onConnectionEnd={handleConnectionEnd}
                                isConnecting={isConnecting}
                                connectingFrom={connectingFrom?.nodeId || null}
                            />
                        ))}

                        {/* 状态面板 */}
                        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border">
                            <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Nodes:</span>
                                    <span className="font-medium">{nodes.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Connections:</span>
                                    <span className="font-medium">{connections.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status:</span>
                                    <Badge variant="outline" className="text-xs">
                                        {isConnecting ? "Connecting" : nodes.length > 0 ? "Ready" : "Empty"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* 空状态提示 */}
                        {nodes.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    {/*<Brain className="w-16 h-16 mx-auto mb-4 text-gray-300"/>*/}
                                    <TorchLabIcon className="w-32 h-32 mx-auto mb-4 text-gray-300"/>
                                    <h3 className="text-xl font-medium mb-2">Start Building Your Network</h3>
                                    <p className="text-sm">Drag layers from the left panel to begin</p>
                                    <p className="text-xs mt-2 text-gray-400">Click on green dots to create connections
                                        between layers</p>
                                </div>
                            </div>
                        )}

                        {/* 连接提示 */}
                        {isConnecting && (
                            <div
                                className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg shadow-lg animate-bounce">
                                <div className="flex items-center gap-2">
                                    <Link className="w-4 h-4"/>
                                    <span className="text-sm font-medium">Click on a blue input dot to connect</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 右侧属性面板 */}
            <div className="w-80 bg-white border-l border-gray-200 p-4">
                <h2 className="text-lg font-semibold mb-4">Properties</h2>

                {selectedNode && selectedNodeIcon ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                {React.createElement(selectedNodeIcon, {className: `w-4 h-4 ${selectedNode.color}`})}
                                {selectedNode.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Layer Type</label>
                                <p className="text-sm text-gray-600">{selectedNode.type}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Input Shape</label>
                                <p className="text-sm text-gray-600 font-mono">{selectedNode.inputShape}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Output Shape</label>
                                <p className="text-sm text-gray-600 font-mono">{selectedNode.outputShape}</p>
                            </div>

                            {Object.keys(selectedNode.params).length > 0 && (
                                <div>
                                    <label className="text-sm font-medium">Parameters</label>
                                    <div className="space-y-2 mt-2">
                                        {Object.entries(selectedNode.params).map(([key, value]) => (
                                            <div key={key} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{key}:</span>
                                                <span className="font-mono">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 连接信息 */}
                            <div>
                                <label className="text-sm font-medium">Connections</label>
                                <div className="space-y-1 mt-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Inputs:</span>
                                        <span className="font-medium">
                      {connections.filter((conn) => conn.to === selectedNode.id && !conn.isDeleting).length}
                    </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Outputs:</span>
                                        <span className="font-medium">
                      {connections.filter((conn) => conn.from === selectedNode.id && !conn.isDeleting).length}
                    </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleNodeDelete(selectedNode.id)}
                                    className="w-full"
                                >
                                    <Trash2 className="w-4 h-4 mr-2"/>
                                    Delete Layer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="text-center text-gray-500 mt-8">
                        <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300"/>
                        <p>Select a layer to view its properties</p>
                        {isConnecting && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg animate-pulse">
                                <Link className="w-8 h-8 mx-auto mb-2 text-blue-500"/>
                                <p className="text-sm text-blue-700">Connection Mode Active</p>
                                <p className="text-xs text-blue-600 mt-1">Click on a blue input dot to complete the
                                    connection</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 模型统计 */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle className="text-base">Model Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Layers:</span>
                            <span className="font-medium">{nodes.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Connections:</span>
                            <span className="font-medium">{connections.filter((conn) => !conn.isDeleting).length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Parameters:</span>
                            <span className="font-medium">~{(nodes.length * 0.5).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Memory:</span>
                            <span className="font-medium">~{(nodes.length * 2.1).toFixed(1)}MB</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
