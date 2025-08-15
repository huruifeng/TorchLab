import json
from typing import Dict, List, Set, Tuple
from collections import defaultdict, deque

'''
1. 拓扑排序：使用Kahn算法对网络层进行拓扑排序，确保正确执行顺序。
2. 分支处理：支持多个输入层（并行分支）。
3. 合并点处理：
    - 自动检测需要合并多个输入的位置
    - 支持不同的合并策略（相加、拼接等）
    - 根据层类型自动选择合适的合并方式
4. 多输出支持：
    - 自动检测所有输出层
    - 支持返回多个输出（作为字典）
5. 特殊层处理：
    - 对ReLU等激活函数进行特殊处理
    - 支持常见的合并操作（Add, Cat等）
6. 变量跟踪：
    - 使用tensor_tracker字典跟踪每个层的输出张量
    - 为每个层创建唯一的变量名（x_layerid）

这个改进版本可以处理以下复杂结构：
    - 并行分支（如Inception模块）
    - 跳跃连接（如ResNet）
    - 多输入 / 多输出网络
    - 复杂的合并操作（相加、拼接等）

JSON输入格式需要包含：
    - nodes: 网络层定义列表
    - connections: 连接关系列表，指定哪些层连接到哪些层
对于合并操作，可以通过在connections中指定多个输入到一个层来实现。
'''

def generate_script(json_file: str, output_file: str = None) -> str:
    """
    Generate PyTorch code from a neural network JSON definition, supporting complex architectures.

    Args:
        json_file: Path to the JSON file containing network definition
        output_file: Optional path to save the generated script

    Returns:
        Generated PyTorch code as a string
    """
    # Load the JSON data
    with open(json_file, 'r') as f:
        data = json.load(f)

    # Initialize code components
    imports = [
        "import torch",
        "import torch.nn as nn",
        "import torch.nn.functional as F",
        ""
    ]

    class_def = [
        "class MyNN(nn.Module):",
        "    def __init__(self):",
        "        super(MyNN, self).__init__()",
        "        "
    ]

    forward_def = [
        "",
        "    def forward(self, x):",
        "        # Layer connections"
    ]

    # Track layer instances and connections
    layer_instances = {}
    connections = []
    adjacency_list = defaultdict(list)
    in_degree = defaultdict(int)
    layer_params = {}

    # Process nodes (layers)
    for node in data['nodes']:
        layer_type = node['type']
        layer_id = node['id']
        params = node.get('params', {})

        # Special handling for certain layer types
        if layer_type == "ReLU":
            code = f"self.{layer_id} = nn.{layer_type}(inplace=True)"
        else:
            code = f"self.{layer_id} = nn.{layer_type}("
            for key, value in params.items():
                code += f"{key}={value}, "
            code = code[:-2] + ")"

        class_def.append(f"        {code}")
        layer_instances[layer_id] = node['type']
        layer_params[layer_id] = params

    # Build graph and calculate in-degrees
    for conn in data['connections']:
        from_layer = conn['from']
        to_layer = conn['to']

        if from_layer in layer_instances and to_layer in layer_instances:
            connections.append((from_layer, to_layer))
            adjacency_list[from_layer].append(to_layer)
            in_degree[to_layer] += 1

    # Find all input layers (those with in_degree 0)
    input_layers = [layer for layer in layer_instances if in_degree[layer] == 0]

    # Topological sort using Kahn's algorithm
    topo_order = []
    queue = deque(input_layers)

    while queue:
        current = queue.popleft()
        topo_order.append(current)

        for neighbor in adjacency_list[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # Track multiple inputs to a layer (for merging)
    merge_points = defaultdict(list)
    for to_layer in layer_instances:
        inputs = [fr for fr, to in connections if to == to_layer]
        if len(inputs) > 1:
            merge_points[to_layer] = inputs

    # Generate forward pass code with branching support
    tensor_tracker = {}
    for layer in topo_order:
        # Handle input layers
        if layer in input_layers:
            forward_def.append(f"        x_{layer} = self.{layer}(x)")
            tensor_tracker[layer] = f"x_{layer}"
            continue

        # Handle merge points (multiple inputs)
        if layer in merge_points:
            input_vars = []
            for input_layer in merge_points[layer]:
                input_vars.append(tensor_tracker[input_layer])

            # Different merge strategies based on layer type
            if layer_instances[layer] in ["Add", "add"]:
                # Element-wise addition
                forward_def.append(f"        x_{layer} = {' + '.join(input_vars)}")
            elif layer_instances[layer] in ["Cat", "Concat", "concat"]:
                # Concatenation along channel dimension (dim=1)
                forward_def.append(f"        x_{layer} = torch.cat([{', '.join(input_vars)}], dim=1)")
            else:
                # Default: sum all inputs
                forward_def.append(f"        x_{layer} = {' + '.join(input_vars)}")

            # Apply the layer after merging
            forward_def.append(f"        x_{layer} = self.{layer}(x_{layer})")
            tensor_tracker[layer] = f"x_{layer}"
            continue

        # Handle normal layers with single input
        input_layers_for_current = [fr for fr, to in connections if to == layer]
        if len(input_layers_for_current) == 1:
            input_layer = input_layers_for_current[0]
            input_var = tensor_tracker[input_layer]

            # Special handling for activation functions
            if layer_instances[layer] in ["ReLU", "Sigmoid", "Tanh"]:
                forward_def.append(f"        x_{layer} = F.{layer_instances[layer].lower()}({input_var})")
            else:
                forward_def.append(f"        x_{layer} = self.{layer}({input_var})")

            tensor_tracker[layer] = f"x_{layer}"

    # Determine output layers (those with no outgoing connections)
    output_layers = [layer for layer in layer_instances
                     if layer not in [conn[0] for conn in connections]]

    # Handle multiple outputs if they exist
    if len(output_layers) == 1:
        forward_def.append(f"        return {tensor_tracker[output_layers[0]]}")
    elif len(output_layers) > 1:
        results_str = ", ".join([f"'{layer}': {tensor_tracker[layer]}" for layer in output_layers])
        forward_def.append("        return {" + results_str + "}")
    else:
        forward_def.append("        return x")

    # Add model instantiation and print
    footer = [
        "",
        "# Create an instance of the network",
        "model = MyNN()",
        "",
        "# Print the model architecture",
        "print(model)",
        "",
        "# Example usage:",
        "# input_tensor = torch.randn(1, 3, 32, 32)  # Batch of 1, 3 channels, 32x32 image",
        "# output = model(input_tensor)"
    ]

    # Combine all parts
    full_code = "\n".join(imports + class_def + forward_def + footer)

    # Save to file if requested
    if output_file:
        with open(output_file, 'w') as f:
            f.write(full_code)

    return full_code


if __name__ == "__main__":
    # Example usage
    json_file = "net.json"  # Path to your JSON file
    output_file = "mynn.py"  # Output file (optional)

    generated_code = generate_script(json_file, output_file)
    print("PyTorch code generated successfully!")
    print(f"Output saved to: {output_file}")