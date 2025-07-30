import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import {Settings, BookOpen, Home, Brain, Zap, Code, BarChart3} from "lucide-react"
import TorchLabIcon from "./TorchLabIcon"

// Menu items
const menuItems = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Workspaces",
        url: "#",
        icon: Brain,
    },
    {
        title: "Templates",
        url: "#",
        icon: Code,
    },
    {
        title: "Analytics",
        url: "#",
        icon: BarChart3,
    },
]

const bottomMenuItems = [
    {
        title: "Settings",
        url: "#",
        icon: Settings,
    },
    {
        title: "Documentation",
        url: "#",
        icon: BookOpen,
    },
]

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                <TorchLabIcon size={32}/>
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                <span
                    className="truncate font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TorchLab
                </span>
                                <span
                                    className="truncate text-xs text-muted-foreground">Visual Deep Learning Platform</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Platform</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon/>
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Features</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Zap className="text-green-600"/>
                                    <span>Real-time Training</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Code className="text-orange-600"/>
                                    <span>Export Code</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    {bottomMenuItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild>
                                <a href={item.url}>
                                    <item.icon/>
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail/>
        </Sidebar>
    )
}
