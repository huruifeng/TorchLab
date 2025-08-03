// 画布变换状态
export interface CanvasTransform {
    x: number
    y: number
    scale: number
}

// 画布配置
export interface CanvasConfig {
    minScale: number
    maxScale: number
    scaleStep: number
    panSensitivity: number
}

// 视图边界
export interface ViewBounds {
    minX: number
    minY: number
    maxX: number
    maxY: number
    width: number
    height: number
    centerX: number
    centerY: number
}
