import json
from typing import Dict, List


def generate_script(json_file: str, output_file: str = None) -> str:
    """
    Generate PyTorch code from a neural network JSON definition.

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

    # Process nodes (layers)
    for node in data['nodes']:
        layer_type = node['type']
        layer_id = node['id']
        params = node.get('params', {})

        code = f"self.{layer_id} = nn.{layer_type}("
        for key, value in params.items():
            code += f"{key}={value}, "
        code = code[:-2] + ")"

        class_def.append(f"        {code}")
        layer_instances[layer_id] = node['type']

    # Process connections for forward pass
    for conn in data['connections']:
        from_layer = conn['from']
        to_layer = conn['to']

        # Only add connection if both layers exist
        if from_layer in layer_instances and to_layer in layer_instances:
            connections.append((from_layer, to_layer))

    # Determine execution order (simple sequential for now)
    # In a real implementation, you'd need topological sorting
    executed_layers = set()
    for from_layer, to_layer in connections:
        if from_layer not in executed_layers:
            forward_def.append(f"        x = self.{from_layer}(x)")
            executed_layers.add(from_layer)
        if to_layer not in executed_layers:
            forward_def.append(f"        x = self.{to_layer}(x)")
            executed_layers.add(to_layer)

    # Add return statement
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