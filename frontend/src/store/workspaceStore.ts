// src/store/workspaceStore.ts
import {create} from 'zustand'
import {nanoid} from 'nanoid'

interface Workspace {
    id: string
    name: string
    createdAt: string
}

interface WorkspaceStore {
    workspaces: Workspace[]
    createWorkspace: (name: string) => string
}

export const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
    workspaces: [],
    createWorkspace: (name) => {
        const newWs = {
            id: nanoid(),
            name,
            createdAt: new Date().toISOString(),
        }
        set((state) => ({
            workspaces: [...state.workspaces, newWs],
        }))
        return newWs.id
    },
}))
