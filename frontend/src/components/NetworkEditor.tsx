"use client"

import React, {useEffect} from "react"
import {useCallback, useRef, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch";
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {
    Play,
    Save,
    Layers,
    RotateCcw,
    Settings,
    Code,
    Eye,
    EyeOff,
    Trash2,
    Link,
    Home,
    ChevronDownIcon,
} from "lucide-react"
import type {NetworkNode, Connection, ConnectionPoint, LayerData} from "@/types/network"
import {layerTypes} from "@/constants/layers"
import {iconMap} from "@/lib/icons"
import {NetworkNode as LayerNode} from "@/components/network/NetworkNode"
import {ConnectionLine} from "@/components/network/ConnectionLine"
import {TempConnectionLine} from "@/components/network/TempConnectionLine"

import { Canvas } from "@/components/canvas/Canvas"
import { CanvasControls } from "@/components/canvas/CanvasControls"
import { useCanvasTransform } from "@/hooks/useCanvasTransform"

import {useNavigate} from "react-router-dom";
import {useWorkspaceStore, type Workspace} from "@/store/workspaceStore.ts";


export default function NetworkEditor({wsid}: {wsid: string}) {

    const canvasRef = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()

    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    // Add this state at the top of your component
    const [editingParam, setEditingParam] = useState<string | null>(null);
    const [editedParams, setEditedParams] = useState<Record<string, any>>({});

// Initialize all categories as collapsed by default
    useEffect(() => {
        const initialExpandedState = layerTypes.reduce((acc, category) => {
            acc[category.category] = false;
            return acc;
        }, {} as Record<string, boolean>);
        setExpandedCategories(initialExpandedState);
    }, [layerTypes]);

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    // 画布变换控制
    const {
        transform,
        isLocked,
        isPanning,
        setIsLocked,
        zoomCanvas,
        resetView,
        fitView,
        startPan,
        updatePan,
        endPan,
        screenToCanvas,
    } = useCanvasTransform()

    const [workspace, setWorkspace] = useState<Workspace | null>(null)
    const [nodes, setNodes] = useState<NetworkNode[]>([])
    const [connections, setConnections] = useState<Connection[]>([])

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
    const [showGrid, setShowGrid] = useState(true)

    const {saveWsNet, getWorkspaceById} = useWorkspaceStore()

    useEffect(() => {
         const fetchWsById = async () => {
            const ws_data = await getWorkspaceById(wsid)
            if (ws_data.success) {
                setWorkspace(ws_data.workspace)
                const net = ws_data.wsnet
                setNodes(net.nodes)
                setConnections(net.connections)
            }
        }
        fetchWsById()
    }, [wsid])

    // 连接状态
    const [isConnecting, setIsConnecting] = useState(false)
    const [connectingFrom, setConnectingFrom] = useState<ConnectionPoint | null>(null)
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0})

    // 画布控制处理函数
    const handleZoomIn = useCallback(() => {
        zoomCanvas(1)
    }, [zoomCanvas])

    const handleZoomOut = useCallback(() => {
        zoomCanvas(-1)
    }, [zoomCanvas])

    const handleFitView = useCallback(() => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect()
            fitView(nodes, rect.width, rect.height)
        }
    }, [fitView, nodes])

    const handleToggleLock = useCallback(() => {
        setIsLocked(!isLocked)
    }, [isLocked, setIsLocked])

    // 画布鼠标事件处理
    const handleCanvasMouseDown = useCallback(
        (e: React.MouseEvent) => {

            // 检查是否点击在连接点上
            const target = e.target as HTMLElement
            if (target.closest("[data-connection-dot]")) {
                return // 不处理连接点的点击
            }

            if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
                // 中键或 Ctrl+左键
                e.preventDefault()
                startPan(e.clientX, e.clientY)
                return
            }

            if (e.button === 0 && !isLocked && !isConnecting) {
                // 左键拖拽画布
                const rect = e.currentTarget.getBoundingClientRect()
                const canvasX = e.clientX - rect.left
                const canvasY = e.clientY - rect.top

                // 检查是否点击在节点上（但不是连接点）
                const clickedNode = nodes.find((node) => {
                    const screenPos = {
                        x: node.x * transform.scale + transform.x,
                        y: node.y * transform.scale + transform.y,
                        width: node.width * transform.scale,
                        height: node.height * transform.scale,
                    }
                    return (
                        canvasX >= screenPos.x &&
                        canvasX <= screenPos.x + screenPos.width &&
                        canvasY >= screenPos.y &&
                        canvasY <= screenPos.y + screenPos.height
                    )
                })

                if (!clickedNode) {
                    startPan(e.clientX, e.clientY)
                }
            }
        },
        [startPan, isLocked, isConnecting, nodes, transform],
    )

    const handleCanvasMouseMove = useCallback(
        (e: React.MouseEvent) => {
            // 更新画布拖拽
            updatePan(e.clientX, e.clientY)

            // 更新连接线鼠标位置 - 使用画布坐标
            if (isConnecting && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect()
                const screenX = e.clientX - rect.left
                const screenY = e.clientY - rect.top

                // 转换为画布坐标
                const canvasPos = screenToCanvas(screenX, screenY)
                setMousePosition(canvasPos)
            }
        },
        [updatePan, isConnecting, screenToCanvas],
    )

    const handleCanvasMouseUp = useCallback(
        (e: React.MouseEvent) => {
            updatePan(e.clientX, e.clientY)
            endPan()
        },
        [endPan],
    )

    const handleCanvasWheel = useCallback(
        (e: React.WheelEvent) => {
            if (isLocked) return

            e.preventDefault()
            const rect = e.currentTarget.getBoundingClientRect()
            const centerX = e.clientX - rect.left
            const centerY = e.clientY - rect.top

            const delta = e.deltaY > 0 ? -1 : 1
            zoomCanvas(delta, centerX, centerY)
        },
        [isLocked, zoomCanvas],
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


    // 动画连接创建
    const animateConnectionCreation = useCallback((connection: Connection) => {
        const duration = 500 // 动画持续时间
        const startTime = Date.now()

        const animate = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)

            // 使用缓动函数
            const easeOutCubic = 1 - Math.pow(1 - progress, 3)

            setConnections((prev) => prev.map((conn) => conn.id === connection.id ? {...conn, isAnimating: true, animationProgress: easeOutCubic} : conn,),)

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

    const onDragStart = (event: React.DragEvent, layerData: LayerData) => {
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

        // 转换屏幕坐标到画布坐标
        const screenX = event.clientX - canvasBounds.left
        const screenY = event.clientY - canvasBounds.top
        const canvasPos = screenToCanvas(screenX, screenY)

        const newNode: NetworkNode = {
            id: `${layerData.type}-${Date.now()}`,
            type: layerData.type,
            label: layerData.label,
            x: canvasPos.x - 70, // Center the node
            y: canvasPos.y - 43,
            width: 140,
            height: 86,
            iconName: layerData.iconName,
            color: layerData.color,
            params: layerData.params,
            inputShape: layerData.inputShape,
            outputShape: layerData.outputShape,
        }

        setNodes((prev) => [...(prev||[]), newNode])
        },
        [screenToCanvas],
    )


    const handleNodeDrag = useCallback((id: string, x: number, y: number) => {
        setNodes((prev) => prev.map((node) => (node.id === id ? {...node, x, y} : node)))

        // Update connections
        setConnections((prev) =>
            prev.map((conn) => {
                if (conn.from === id) {
                    return {
                        ...conn,
                        fromX: x + 70, // Center of node
                        fromY: y + 86, // Bottom of node
                    }
                }
                if (conn.to === id) {
                    return {
                        ...conn,
                        toX: x + 70, // Center of node
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
            const relatedConnections = connections?.filter((conn) => conn.from === id || conn.to === id)
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

    // // 鼠标移动处理（用于临时连接线）
    // const handleMouseMove = useCallback(
    //     (e: React.MouseEvent) => {
    //         if (isConnecting && canvasRef.current) {
    //             const canvasBounds = canvasRef.current.getBoundingClientRect()
    //             setMousePosition({
    //                 x: e.clientX - canvasBounds.left,
    //                 y: e.clientY - canvasBounds.top,
    //             })
    //         }
    //     },
    //     [isConnecting],
    // )


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


    const handelSaveNet = async () => {
        const net = {
            nodes: nodes.map((node) => ({
                id: node.id,
                type: node.type,
                label: node.label,
                x: node.x,
                y: node.y,
                width: node.width,
                height: node.height,
                iconName: node.iconName,
                color: node.color,
                params: node.params,
                inputShape: node.inputShape,
                outputShape: node.outputShape,
            })),
            connections: connections.map((conn) => ({
                id: conn.id,
                from: conn.from,
                to: conn.to,
                fromX: conn.fromX,
                fromY: conn.fromY,
                toX: conn.toX,
                toY: conn.toY,
                isAnimating: conn.isAnimating,
                animationProgress: conn.animationProgress,
            })),
        }
        saveWsNet(wsid, net)
    }

    const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null
    const selectedNodeIcon = selectedNode ? iconMap[selectedNode.iconName] || Layers : null

    useEffect(() => {
      if (selectedNode) {
        setEditedParams({...selectedNode.params});
      }
    }, [selectedNode]);

    // Add this handler to update node parameters
    const handleParamChange = (paramName: string, value: any) => {
        setEditedParams(prev => ({
            ...prev,
            [paramName]: value
        }));
    };

    const saveParams = () => {
        if (!selectedNodeId) return;

        setNodes(prev => prev.map(node =>
            node.id === selectedNodeId
                ? {...node, params: {...editedParams}}
                : node
        ));
        setEditingParam(null);

        handelSaveNet();
    };


    return (
        <div className="flex h-screen bg-gray-50">
            {/* 左侧工具栏 */}
            <div className="w-64 min-w-60 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-4">Layer Library</h2>

                    {/* Search input */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search layers..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {layerTypes.map((category) => {
                        // Filter layers based on search query
                        const filteredLayers = category.layers.filter(layer =>
                            layer.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            layer.type.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                        // Skip the category if no layers match the search and there's a search query
                        if (filteredLayers.length === 0 && searchQuery) return null;

                        return (
                            <div key={category.category} className="mb-4">
                                <button
                                    className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2 focus:outline-none"
                                    onClick={() => toggleCategory(category.category)}
                                >
                                    <span>{category.category}</span>
                                    <ChevronDownIcon
                                        className={`w-4 h-4 transition-transform duration-200 ${
                                            expandedCategories[category.category] ? 'rotate-0' : '-rotate-90'
                                        }`}
                                    />
                                </button>

                                {expandedCategories[category.category] && (
                                    <div className="space-y-2">
                                        {filteredLayers.map((layer) => {
                                            const LayerIcon = iconMap[layer.iconName] || Layers;
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
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 主编辑区域 */}
            <div className="flex-1 flex flex-col">
                {/* 顶部工具栏 */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold">Network Editor</h1>
                            <Badge variant="outline">{workspace?.name}</Badge>
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
                                <RotateCcw className="w-4 h-4 mr-2"/>Clear
                            </Button>
                            <Button variant="outline" size="sm" onClick={generateCode}>
                                <Code className="w-4 h-4 mr-2"/>Generate Code
                            </Button>
                            <Separator orientation="vertical" className="h-6"/>
                            <Button variant="outline" size="sm" onClick={handelSaveNet}>
                                <Save className="w-4 h-4 mr-2"/>Save
                            </Button>
                            <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600">
                                <Play className="w-4 h-4 mr-2"/>Train Model
                            </Button>
                        </div>
                    </div>
                </div>

                {/* 画布区域 */}
                 <div className="flex-1 relative overflow-hidden" ref={canvasRef}>
                     {/* 画布控制器 */}
                     <CanvasControls
                         transform={transform}
                         isLocked={isLocked}
                         onZoomIn={handleZoomIn}
                         onZoomOut={handleZoomOut}
                         onFitView={handleFitView}
                         onResetView={resetView}
                         onToggleLock={handleToggleLock}
                     />

                     <Canvas
                         transform={transform}
                         isLocked={isLocked}
                         isPanning={isPanning}
                         showGrid={showGrid}
                         onMouseDown={handleCanvasMouseDown}
                         onMouseMove={handleCanvasMouseMove}
                         onMouseUp={handleCanvasMouseUp}
                         onWheel={handleCanvasWheel}
                         onClick={handleCanvasClick}
                         onDragOver={onDragOver}
                         onDrop={onDrop}
                         svgContent={
                             <>
                                 {/* 现有连接线 */}
                                 {connections.map((connection) => (<ConnectionLine key={connection.id} connection={connection} onDelete={handleConnectionDelete}/>))}
                                 {/* 临时连接线 */}
                                 {isConnecting && connectingFrom && (<TempConnectionLine from={{x: connectingFrom.x, y: connectingFrom.y}} to={mousePosition}/>)}
                             </>
                         }
                         nodes={nodes}
                         connections={connections}
                         isConnecting={isConnecting}
                     >

                        {/* 节点 */}
                        {nodes?.map((node) => (
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
                    </Canvas>
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

                            {Object.entries(selectedNode.params).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center text-sm py-1">
                                    <span className="text-gray-600">{key}:</span>
                                    {editingParam === key ? (
                                        <div className="flex items-center gap-2">
                                            {typeof value === 'boolean' ? (
                                                <Switch
                                                    checked={editedParams[key]}
                                                    onCheckedChange={(val) => handleParamChange(key, val)}
                                                />
                                            ) : typeof value === 'number' ? (
                                                <input
                                                    type="number"
                                                    value={editedParams[key]}
                                                    onChange={(e) => handleParamChange(key, Number(e.target.value))}
                                                    className="border rounded px-2 py-1 text-xs w-24"
                                                    autoFocus
                                                />
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={editedParams[key]}
                                                    onChange={(e) => handleParamChange(key, e.target.value)}
                                                    className="border rounded px-2 py-1 text-xs w-24"
                                                    autoFocus
                                                />
                                            )}
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={saveParams}>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                                    <path d="M17 21v-8H7v8"/>
                                                    <path d="M7 3v5h8"/>
                                                </svg>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono">
                                              {typeof value === 'boolean' ? (value ? 'True' : 'False') : (String(value))}
                                            </span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6"
                                                onClick={() => setEditingParam(key)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="12"
                                                    height="12"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* 连接信息 */}
                            <div>
                                <label className="text-sm font-medium">Connections</label>
                                <div className="space-y-1 mt-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Inputs:</span>
                                        <span className="font-medium">
                      {connections?.filter((conn) => conn.to === selectedNode.id && !conn.isDeleting).length}
                    </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Outputs:</span>
                                        <span className="font-medium">
                      {connections?.filter((conn) => conn.from === selectedNode.id && !conn.isDeleting).length}
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
                            <span className="font-medium">{nodes?.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Connections:</span>
                            <span className="font-medium">{connections?.filter((conn) => !conn.isDeleting).length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Parameters:</span>
                            <span className="font-medium">~{(nodes?.length * 0.5).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Memory:</span>
                            <span className="font-medium">~{(nodes?.length * 2.1).toFixed(1)}MB</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
