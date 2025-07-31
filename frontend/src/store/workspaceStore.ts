// src/store/workspaceStore.ts
import {create} from 'zustand'
import {nanoid} from 'nanoid'
import axios from 'axios'
import {getFormattedDateTime} from "@/lib/utils.ts";

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
    removeWorkspace: (id: string) => Promise<void>
    copyWorkspace: (id: string) => Promise<void>
    editWorkspace: (id: string, name: string, description: string, modelType: string) => Promise<void>
}

export const useWorkspaceStore = create<WorkspaceStore>()((set) => ({
    workspaces: [],
    setWorkspaces: (workspaces) => set({workspaces}),
    getWorkspaces: async () => {
        try {
            const { data } = await axios.get(`${WS_URL}/getws`)
            console.log(data)
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
            createdAt: getFormattedDateTime(),
            lastModified: getFormattedDateTime(),
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
    removeWorkspace: async (id) => {
        try {
            const { data } = await axios.delete(`${WS_URL}/deletews/${id}`)
            if (data.success) {
                set((state) => ({
                    workspaces: state.workspaces.filter((ws) => ws.id !== id),
                }))
            }

        } catch (error) {
            console.error('Failed to delete workspace', error)
        }
    },
    copyWorkspace: async (id: string) => {
        try {
            const { data } = await axios.get(`${WS_URL}/copyws/${id}`)
            if (data.success) {
                set((state) => ({
                    workspaces: [...state.workspaces, data.workspace],
                }))
            }
        } catch (error) {
            console.error('Failed to copy workspace', error)
        }
    },

    editWorkspace: async (id: string, name: string, description: string, modelType: string) => {
        try {
            const { data } = await axios.put(`${WS_URL}/editws/${id}`, { name, description, modelType })
            if (data.success) {
                set((state) => ({
                    workspaces: state.workspaces.map((ws) => {
                        if (ws.id === id) {
                            return { ...ws, name, description, modelType, lastModified: getFormattedDateTime() }
                        }
                        return ws
                    }),
                }))
            }
        } catch (error) {
            console.error('Failed to edit workspace', error)
        }
    },
}))
