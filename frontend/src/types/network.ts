// 节点接口定义
export interface NetworkNode {
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
export interface Connection {
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
export interface ConnectionPoint {
    nodeId: string
    type: "input" | "output"
    x: number
    y: number
}

// 层数据接口
export interface LayerData {
    type: string
    label: string
    iconName: string
    color: string
    params: Record<string, unknown>
    inputShape: string
    outputShape: string
}

// 层分类接口
export interface LayerCategory {
    category: string
    layers: LayerData[]
}
