// src/pages/Editor.tsx
import {useParams} from "react-router-dom";
import {useWorkspaceStore} from "@/store/workspaceStore";
import {Button} from "@/components/ui/button";
import ReactFlow, {Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge} from "reactflow";
import type {Connection} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
    {
        id: '1',
        type: 'input',
        data: {label: 'Input'},
        position: {x: 250, y: 50},
    },
    {
        id: '2',
        data: {label: 'Conv2D'},
        position: {x: 250, y: 150},
    },
    {
        id: '3',
        type: 'output',
        data: {label: 'Output'},
        position: {x: 250, y: 300},
    },
];

const initialEdges = [
    {id: 'e1-2', source: '1', target: '2'},
    {id: 'e2-3', source: '2', target: '3'},
];

export default function Editor() {
    const {id} = useParams<{ id: string }>();
    const workspace = useWorkspaceStore((state) =>
        state.workspaces.find((ws) => ws.id === id)
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = (params: Connection) => setEdges((eds) => addEdge(params, eds));

    if (!workspace) {
        return (
            <div className="p-8 text-center text-red-500">
                <h1 className="text-2xl font-bold">Workspace not found</h1>
                <p className="mt-4">Invalid workspace ID: {id}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">🧠 {workspace.name}</h1>
                <Button variant="outline" onClick={() => window.location.href = "/"}>Back to Home</Button>
            </header>

            <section className="border p-4 rounded-xl shadow bg-gray-50 h-[70vh]">
                <h2 className="text-xl font-semibold mb-4">🛠️ Network Builder</h2>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <MiniMap/>
                    <Controls/>
                    <Background gap={12} size={1}/>
                </ReactFlow>
            </section>
        </div>
    );
}
