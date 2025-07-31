// src/store/workspaceStore.ts
import {create} from 'zustand'
import {nanoid} from 'nanoid'
import axios from 'axios'

const BASE_URL = 'http://localhost:8000'
const WS_URL = `${BASE_URL}/workspaces`

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
    setWorkspaces: (workspaces: Workspace[]) => void
    getWorkspaces: () => Promise<Workspace[]>
    createWorkspace: (name: string, description: string, modelType: string) => Promise<string>
    removeWorkspace: (id: string) => void
}

export const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
    workspaces: [],
    setWorkspaces: (workspaces) => set({workspaces}),
    getWorkspaces: async () => {
        try {
            const { data } = await axios.get(`${WS_URL}/getws`)
            if (data.success) {
                set(() => ({
                    workspaces: data.workspaces,
                }))
                return data.workspaces as Workspace[]
            }
            return []
        } catch (error) {
            console.error('Failed to fetch workspaces', error)
            return []
        }
    },
    createWorkspace: async (name, description, modelType) => {
        const newWs: Workspace = {
            id: nanoid(),
            name,
            description: description,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            modelType: modelType,
            status: "Draft",
        }

        try {
            const { data } = await axios.post(`${WS_URL}/createws`, newWs)
            if (data.success) {
                set((state) => ({
                    workspaces: [...state.workspaces, newWs],
                }))
                return newWs.id
            } else {
                return 'Error creating workspace'
            }
        } catch (error) {
            console.error('Failed to create workspace', error)
            return 'Error trying to create workspace'
        }

    },
    removeWorkspace: (id) => {
        set((state) => ({
            workspaces: state.workspaces.filter((ws) => ws.id !== id),
        }))
    },
}))
