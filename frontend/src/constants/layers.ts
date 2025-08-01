import type {LayerCategory} from "@/types/network"

// 预定义的层类型
export const layerTypes: LayerCategory[] = [
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
