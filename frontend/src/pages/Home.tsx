"use client"

import {useState} from "react"
import {useNavigate} from "react-router-dom";
import {nanoid} from "nanoid";
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Badge} from "@/components/ui/badge"
import {Textarea} from "@/components/ui/textarea"
import {Select,SelectTrigger, SelectValue, SelectContent, SelectItem} from "@/components/ui/select"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {Separator} from "@/components/ui/separator"
import {
    Plus,
    Zap,
    Code,
    BarChart3,
    Play,
    Calendar,
    Clock,
    Trash2,
    Copy,
    Blocks,
    Images,
    Newspaper,
} from "lucide-react"
import TorchLabIcon from "@/components/TorchLabIcon"
import {AppSidebar} from "@/components/AppSidebar"


interface Workspace {
    id: string
    name: string
    description: string
    createdAt: string
    lastModified: string
    modelType: string
    status: string
}
const modelTypes = ["DNN", "CNN", "RNN", "Transformer", "Custom"]

export default function HomePage() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([
        {
            id: "1",
            name: "Image Classification Model",
            description: "CNN for CIFAR-10 dataset classification",
            createdAt: "2024-01-15",
            lastModified: "2024-01-20",
            modelType: "CNN",
            status: "Completed",
        },
        {
            id: "2",
            name: "Text Sentiment Analysis",
            description: "LSTM model for sentiment classification",
            createdAt: "2024-01-18",
            lastModified: "2024-01-19",
            modelType: "RNN",
            status: "Training",
        },
        {
            id: "3",
            name: "Language Translation",
            description: "Transformer model for EN-ZH translation",
            createdAt: "2024-01-20",
            lastModified: "2024-01-20",
            modelType: "Transformer",
            status: "Draft",
        },
    ])
    const navigate = useNavigate()

    const [newWorkspace, setNewWorkspace] = useState({
        name: "",
        description: "",
        modelType: "",
    })
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    const handleCreateWorkspace = () => {
        if (newWorkspace.name.trim()) {
            const workspace: Workspace = {
                id: nanoid(),
                name: newWorkspace.name,
                description: newWorkspace.description,
                createdAt: new Date().toISOString().split("T")[0],
                lastModified: new Date().toISOString().split("T")[0],
                modelType: newWorkspace.modelType,
                status: "Draft",
            }
            setWorkspaces([workspace, ...workspaces])
            setNewWorkspace({name: "", description: "", modelType: "Custom"})
            setIsCreateDialogOpen(false)
        }
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Completed":
                return "default"
            case "Training":
                return "secondary"
            case "Draft":
                return "outline"
            default:
                return "outline"
        }
    }

    const getModelTypeVariant = (type: string) => {
        switch (type) {
            case "CNN":
                return "secondary"
            case "RNN":
                return "outline"
            case "Transformer":
                return "default"
            case "Custom":
                return "destructive"
            default:
                return "outline"
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar/>
            <SidebarInset>
                {/* Header with breadcrumb */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1"/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">TorchLab</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block"/>
                            <BreadcrumbItem>
                                <BreadcrumbPage>Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                {/* Main content */}
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 -m-4 p-8">
                        <main className="container mx-auto px-4 py-8">
                            {/* Hero Section */}
                            <div className="text-center mb-12">
                                <h2 className="text-4xl font-bold text-gray-900 mb-4">Build Neural Networks
                                    Visually</h2>
                                <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                                    Drag, drop, and connect PyTorch modules to create powerful deep learning models. No
                                    coding required -
                                    just pure visual creativity.
                                </p>

                                {/* Feature highlights */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                    {[
                                        {
                                            icon: Blocks,
                                            title: "Drag & Drop",
                                            desc: "Visual module composition",
                                            color: "text-blue-600"
                                        },
                                        {
                                            icon: Zap,
                                            title: "Real-time Training",
                                            desc: "Live training visualization",
                                            color: "text-green-600",
                                        },
                                        {
                                            icon: BarChart3,
                                            title: "Analytics",
                                            desc: "Performance insights",
                                            color: "text-purple-600"
                                        },
                                        {
                                            icon: Code,
                                            title: "Export Code",
                                            desc: "Generate PyTorch scripts",
                                            color: "text-orange-600"
                                        },
                                    ].map((feature, index) => (
                                        <div key={index} className="flex flex-col items-center p-4">
                                            <div
                                                className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                                                <feature.icon className={`w-6 h-6 ${feature.color}`}/>
                                            </div>
                                            <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground text-center">{feature.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Workspaces Section */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">Your Workspaces</h3>
                                        <p className="text-muted-foreground">Create and manage your deep learning
                                            projects</p>
                                    </div>
                                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                                <Plus className="w-4 h-4 mr-2"/>
                                                New Workspace
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle>Create New Workspace</DialogTitle>
                                                <DialogDescription>Start building your neural network with a new
                                                    workspace.</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="name" className="text-right">
                                                        Name
                                                    </Label>
                                                    <Input
                                                        id="name"
                                                        value={newWorkspace.name}
                                                        onChange={(e) => setNewWorkspace({
                                                            ...newWorkspace,
                                                            name: e.target.value
                                                        })}
                                                        className="col-span-3"
                                                        placeholder="My Neural Network"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="description" className="text-right">Description</Label>
                                                    <Textarea
                                                        id="description"
                                                        value={newWorkspace.description}
                                                        onChange={(e) => setNewWorkspace({
                                                            ...newWorkspace,
                                                            description: e.target.value
                                                        })}
                                                        className="col-span-3"
                                                        placeholder="Brief description of your project"
                                                        rows={3}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="description" className="text-right">Model Type</Label>
                                                    <Select
                                                        value={newWorkspace.modelType}
                                                        onValueChange={(value) => setNewWorkspace({
                                                            ...newWorkspace,
                                                            modelType: value
                                                        })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select model type"/>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {modelTypes.map((modelType) => (
                                                                <SelectItem key={modelType} value={modelType}>
                                                                    {modelType}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button onClick={handleCreateWorkspace} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                                    Create Workspace
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Workspaces Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {workspaces.map((ws) => (
                                        <Card key={ws.id}
                                              className="hover:shadow-lg transition-shadow cursor-pointer group">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                                                            {ws.name}
                                                        </CardTitle>
                                                        <CardDescription className="mt-1">{ws.description}</CardDescription>
                                                    </div>
                                                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="sm">
                                                            <Copy className="w-4 h-4"/>
                                                        </Button>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="w-4 h-4"/>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex space-x-2">
                                                        <Badge
                                                            variant={getModelTypeVariant(ws.modelType)}>{ws.modelType}</Badge>
                                                        <Badge variant={getStatusVariant(ws.status)}>{ws.status}</Badge>
                                                    </div>
                                                </div>

                                                <div
                                                    className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1"/>
                                                        {ws.createdAt}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1"/>
                                                        {ws.lastModified}
                                                    </div>
                                                </div>

                                                <Button className="w-full bg-transparent" variant="outline"
                                                        onClick={() => navigate(`/workspace/${ws.id}`)}>
                                                    <Play className="w-4 h-4 mr-2"/>
                                                    Open Workspace
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))}

                                    {/* Create New Workspace Card */}
                                    <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group"
                                        onClick={() => setIsCreateDialogOpen(true)}
                                    >
                                        <CardContent className="flex flex-col items-center justify-center h-full py-12">
                                            <div className="w-16 h-16 bg-gray-100 group-hover:bg-blue-50 rounded-full flex items-center justify-center mb-4 transition-colors">
                                                <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors"/>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors mb-2">
                                                Create New Workspace
                                            </h3>
                                            <p className="text-sm text-muted-foreground text-center">
                                                Start building your next neural network
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Quick Start Section */}
                            <div className="bg-white rounded-xl p-8 shadow-sm border">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Start Templates</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        {
                                            icon: Images,
                                            title: "Image Classification",
                                            desc: "CNN template for image tasks",
                                            color: "text-purple-600",
                                            bgColor: "bg-purple-100",
                                        },
                                        {
                                            icon: Newspaper,
                                            title: "Text Processing",
                                            desc: "RNN/LSTM for NLP tasks",
                                            color: "text-orange-600",
                                            bgColor: "bg-orange-100",
                                        },
                                        {
                                            icon: TorchLabIcon,
                                            title: "Custom Network",
                                            desc: "Start from scratch",
                                            color: "text-cyan-600",
                                            bgColor: "bg-cyan-100",
                                        },
                                    ].map((template, index) => (
                                        <Button
                                            key={index}
                                            variant="outline"
                                            className="h-auto p-4 flex flex-col items-start justify-start text-left bg-transparent"
                                        >
                                            <div
                                                className={`w-8 h-8 ${template.bgColor} rounded-lg flex items-center justify-center mb-2`}>
                                                <template.icon className={`w-4 h-4 ${template.color}`}/>
                                            </div>
                                            <div className="text-left">
                                                <div className="font-semibold">{template.title}</div>
                                                <div className="text-sm text-muted-foreground">{template.desc}</div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
