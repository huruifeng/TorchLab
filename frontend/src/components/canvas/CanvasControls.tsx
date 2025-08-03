"use client"

import type React from "react"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {ZoomIn, ZoomOut, Maximize2, RotateCcw, Lock, Unlock, Move, MousePointer} from "lucide-react"
import type {CanvasTransform} from "@/types/canvas"

interface CanvasControlsProps {
    transform: CanvasTransform
    isLocked: boolean
    onZoomIn: () => void
    onZoomOut: () => void
    onFitView: () => void
    onResetView: () => void
    onToggleLock: () => void
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
                                                                  transform,
                                                                  isLocked,
                                                                  onZoomIn,
                                                                  onZoomOut,
                                                                  onFitView,
                                                                  onResetView,
                                                                  onToggleLock,
                                                              }) => {
    const zoomPercentage = Math.round(transform.scale * 100)

    return (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border p-2 z-10">
            <div className="flex items-center gap-2">
                {/* 锁定控制 */}
                <Button
                    variant={isLocked ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleLock}
                    className={isLocked ? "bg-red-500 hover:bg-red-600" : ""}
                >
                    {isLocked ? <Lock className="w-4 h-4"/> : <Unlock className="w-4 h-4"/>}
                </Button>

                <Separator orientation="vertical" className="h-6"/>

                {/* 缩放控制 */}
                <Button variant="outline" size="sm" onClick={onZoomOut} disabled={isLocked}>
                    <ZoomOut className="w-4 h-4"/>
                </Button>

                <Badge variant="outline" className="min-w-[60px] justify-center">
                    {zoomPercentage}%
                </Badge>

                <Button variant="outline" size="sm" onClick={onZoomIn} disabled={isLocked}>
                    <ZoomIn className="w-4 h-4"/>
                </Button>

                <Separator orientation="vertical" className="h-6"/>

                {/* 视图控制 */}
                <Button variant="outline" size="sm" onClick={onFitView} disabled={isLocked} title="Fit View">
                    <Maximize2 className="w-4 h-4"/>
                </Button>

                <Button variant="outline" size="sm" onClick={onResetView} disabled={isLocked} title="Reset View">
                    <RotateCcw className="w-4 h-4"/>
                </Button>

                <Separator orientation="vertical" className="h-6"/>

                {/* 状态指示 */}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    {isLocked ? (
                        <>
                            <MousePointer className="w-3 h-3"/>
                            <span>Locked</span>
                        </>
                    ) : (
                        <>
                            <Move className="w-3 h-3"/>
                            <span>Pan & Zoom</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
