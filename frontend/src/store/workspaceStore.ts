// src/store/workspaceStore.ts
import {create} from 'zustand'
import {nanoid} from 'nanoid'

interface Workspace {
    id: string
    name: string
    description: string
    createdAt: string
    lastModified: string
    modelType: string
    status: string
}

interface WorkspaceStore {
    workspaces: Workspace[]
    createWorkspace: (name: string, description: string) => string
    removeWorkspace: (id: string) => void
}

export const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
    workspaces: [],
    createWorkspace: (name, description) => {
        const newWs = {
            id: nanoid(),
            name,
            description: description,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            modelType: "Unknown",
            status: "Draft",
        }
        set((state) => ({
            workspaces: [...state.workspaces, newWs],
        }))
        return newWs.id
    },
    removeWorkspace: (id) => {
        set((state) => ({
            workspaces: state.workspaces.filter((ws) => ws.id !== id),
        }))
    },
}))
