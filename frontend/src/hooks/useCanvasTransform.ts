"use client"

import {useState, useCallback, useRef} from "react"
import type {CanvasTransform, CanvasConfig, ViewBounds} from "@/types/canvas"
import type {NetworkNode} from "@/types/network"

const DEFAULT_CONFIG: CanvasConfig = {
    minScale: 0.1,
    maxScale: 3,
    scaleStep: 0.1,
    panSensitivity: 1,
}

export const useCanvasTransform = (config: Partial<CanvasConfig> = {}) => {
    const finalConfig = {...DEFAULT_CONFIG, ...config}

    const [transform, setTransform] = useState<CanvasTransform>({
        x: 0,
        y: 0,
        scale: 1,
    })

    const [isLocked, setIsLocked] = useState(false)
    const [isPanning, setIsPanning] = useState(false)
    const panStartRef = useRef<{ x: number; y: number; transformX: number; transformY: number } | null>(null)

    // 设置变换
    const setCanvasTransform = useCallback(
        (newTransform: Partial<CanvasTransform>) => {
            if (isLocked) return

            setTransform((prev) => ({
                ...prev,
                ...newTransform,
                scale: Math.max(DEFAULT_CONFIG.minScale, Math.min(DEFAULT_CONFIG.maxScale, newTransform.scale ?? prev.scale)),
            }))
        },
        [isLocked],
    )

    // 平移画布
    const panCanvas = useCallback(
        (deltaX: number, deltaY: number) => {
            if (isLocked) return

            setTransform((prev) => ({
                ...prev,
                x: prev.x + deltaX * finalConfig.panSensitivity,
                y: prev.y + deltaY * finalConfig.panSensitivity,
            }))
        },
        [isLocked, finalConfig.panSensitivity],
    )

    // 缩放画布
    const zoomCanvas = useCallback(
        (delta: number, centerX?: number, centerY?: number) => {
            if (isLocked) return

            setTransform((prev) => {
                const newScale = Math.max(
                    DEFAULT_CONFIG.minScale,
                    Math.min(DEFAULT_CONFIG.maxScale, prev.scale + delta * finalConfig.scaleStep),
                )

                if (newScale === prev.scale) return prev

                // 如果提供了中心点，围绕该点缩放
                if (centerX !== undefined && centerY !== undefined) {
                    const scaleRatio = newScale / prev.scale
                    const newX = centerX - (centerX - prev.x) * scaleRatio
                    const newY = centerY - (centerY - prev.y) * scaleRatio

                    return {
                        x: newX,
                        y: newY,
                        scale: newScale,
                    }
                }

                return {
                    ...prev,
                    scale: newScale,
                }
            })
        },
        [isLocked, finalConfig],
    )

    // 重置视图
    const resetView = useCallback(() => {
        if (isLocked) return

        setTransform({
            x: 0,
            y: 0,
            scale: 1,
        })
    }, [isLocked])

    // 计算节点边界
    const calculateNodesBounds = useCallback((nodes: NetworkNode[]): ViewBounds | null => {
        if (nodes.length === 0) return null

        let minX = Number.POSITIVE_INFINITY
        let minY = Number.POSITIVE_INFINITY
        let maxX = Number.NEGATIVE_INFINITY
        let maxY = Number.NEGATIVE_INFINITY

        nodes.forEach((node) => {
            minX = Math.min(minX, node.x)
            minY = Math.min(minY, node.y)
            maxX = Math.max(maxX, node.x + node.width)
            maxY = Math.max(maxY, node.y + node.height)
        })

        const padding = 100 // 边界填充
        minX -= padding
        minY -= padding
        maxX += padding
        maxY += padding

        return {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX,
            height: maxY - minY,
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2,
        }
    }, [])

    // 适应视图
    const fitView = useCallback(
        (nodes: NetworkNode[], containerWidth: number, containerHeight: number) => {
            if (isLocked || nodes.length === 0) return

            const bounds = calculateNodesBounds(nodes)
            if (!bounds) return

            // 计算缩放比例
            const scaleX = containerWidth / bounds.width
            const scaleY = containerHeight / bounds.height
            const newScale = Math.max(
                DEFAULT_CONFIG.minScale,
                Math.min(DEFAULT_CONFIG.maxScale, Math.min(scaleX, scaleY) * 0.9), // 0.9 for some margin
            )

            // 计算居中位置
            const newX = containerWidth / 2 - bounds.centerX * newScale
            const newY = containerHeight / 2 - bounds.centerY * newScale

            setTransform({
                x: newX,
                y: newY,
                scale: newScale,
            })
        },
        [isLocked, calculateNodesBounds],
    )

    // 开始拖拽
    const startPan = useCallback(
        (clientX: number, clientY: number) => {
            if (isLocked) return false

            setIsPanning(true)
            panStartRef.current = {
                x: clientX,
                y: clientY,
                transformX: transform.x,
                transformY: transform.y,
            }
            return true
        },
        [isLocked, transform],
    )

    // 拖拽中
    const updatePan = useCallback(
        (clientX: number, clientY: number) => {
            if (!isPanning || !panStartRef.current || isLocked) return

            const deltaX = clientX - panStartRef.current.x
            const deltaY = clientY - panStartRef.current.y

            setTransform({
                ...transform,
                x: panStartRef.current.transformX + deltaX,
                y: panStartRef.current.transformY + deltaY,
            })
        },
        [isPanning, isLocked, transform],
    )

    // 结束拖拽
    const endPan = useCallback(() => {
        setIsPanning(false)
        panStartRef.current = null
    }, [])

    // 屏幕坐标转换为画布坐标
    const screenToCanvas = useCallback(
        (screenX: number, screenY: number) => {
            return {
                x: (screenX - transform.x) / transform.scale,
                y: (screenY - transform.y) / transform.scale,
            }
        },
        [transform],
    )

    // 画布坐标转换为屏幕坐标
    const canvasToScreen = useCallback(
        (canvasX: number, canvasY: number) => {
            return {
                x: canvasX * transform.scale + transform.x,
                y: canvasY * transform.scale + transform.y,
            }
        },
        [transform],
    )

    return {
        transform,
        isLocked,
        isPanning,
        setIsLocked,
        setCanvasTransform,
        panCanvas,
        zoomCanvas,
        resetView,
        fitView,
        startPan,
        updatePan,
        endPan,
        screenToCanvas,
        canvasToScreen,
        calculateNodesBounds,
    }
}
