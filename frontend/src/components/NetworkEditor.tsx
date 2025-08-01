"use client"

import React from "react"
import {useCallback, useRef, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {Play, Save, Layers, RotateCcw, Settings, Code, Eye, EyeOff, Trash2, Link, Home} from "lucide-react"
import TorchLabIcon from "./TorchLabIcon.tsx"
import type {NetworkNode, Connection, ConnectionPoint} from "@/types/network"
import {layerTypes} from "@/constants/layers"
import {iconMap} from "@/lib/icons"
import {NetworkNode as LayerNode} from "@/components/network/NetworkNode"
import {ConnectionLine} from "@/components/network/ConnectionLine"
import {TempConnectionLine} from "@/components/network/TempConnectionLine"
import {useNavigate} from "react-router-dom";


export default function NetworkEditor({wsid}: {wsid: string|undefined}) {
    const canvasRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
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
            params: {shape: "[batch, 784]"},
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
            params: {in_features: 784, out_features: 256},
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
            params: {p: 0.3},
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
            params: {in_features: 256, out_features: 128},
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
            params: {dim: 1},
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
                                            className="cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200 hover:scale-105 py-0"
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
                            <Badge variant="outline">{wsid}</Badge>
                            {isConnecting && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 animate-pulse">
                                    <Link className="w-3 h-3 mr-1"/>
                                    Connecting...
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
                                <Home className="w-4 h-4 mr-2"/>
                                Back to Home
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
                                {showGrid ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}Grid
                            </Button>
                            <Button variant="outline" size="sm" onClick={clearCanvas}>
                                <RotateCcw className="w-4 h-4 mr-2"/>
                                Clear
                            </Button>
                            <Button variant="outline" size="sm" onClick={generateCode}>
                                <Code className="w-4 h-4 mr-2"/>
                                Generate Code
                            </Button>
                            <Separator orientation="vertical" className="h-6"/>
                            <Button variant="outline" size="sm">
                                <Save className="w-4 h-4 mr-2"/>
                                Save
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                                <Play className="w-4 h-4 mr-2"/>
                                Train Model
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
                        <svg className="absolute inset-0" width="100%" height="100%"
                             style={{zIndex: 1, pointerEvents: "none"}}>
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
                                    {/*<Brain className="w-16 h-16 mx-auto mb-4 text-gray-300/>*/}
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
