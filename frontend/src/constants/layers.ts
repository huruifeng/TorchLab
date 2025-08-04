import type {LayerCategory} from "@/types/network"

// 预定义的层类型
export const layerTypes: LayerCategory[] = [
    {
        category: "Input",
        layers: [
            {
                type: "Input",
                label: "Input",
                iconName: "Layers",
                color: "text-blue-600",
                params: {in_features: 784, out_features: 128, bias: true,device: "cpu", dtype: "float32"},
                inputShape: "None",
                outputShape: "[batch, Out]",
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
                params: {in_features: 784, out_features: 128, bias: true,device: "cpu", dtype: "float32"},
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
                type: "Conv1d",
                label: "Conv1D",
                iconName: "Layers",
                color: "text-blue-600",
                params: {in_channels: 4, out_channels: 64, kernel_size: 3, stride: 1, padding: 0, dilation: 1, groups: 1, bias: true, padding_mode: "zeros", device: null, dtype: null},
                inputShape: "[batch, In, L]",
                outputShape: "[batch, Out, L']",
            },
            {
                type: "Conv2d",
                label: "Conv2D",
                iconName: "Layers",
                color: "text-green-600",
                params: {in_channels: 3, out_channels: 64, kernel_size: 3, stride: 1, padding: 0, dilation: 1, groups: 1, bias: true, padding_mode: "zeros", device: null, dtype: null},
                inputShape: "[batch, In, H, W]",
                outputShape: "[batch, Out, H', W']",
            },
            {
                type: "Conv3d",
                label: "Conv3D",
                iconName: "Layers",
                color: "text-yellow-600",
                params: {in_channels: 3, out_channels: 64, kernel_size: 3},
                inputShape: "[batch, In, D, H, W]",
                outputShape: "[batch, Out, D', H', W']",
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
