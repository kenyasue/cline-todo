export interface Todo {
    id: string
    title: string
    description?: string
    completed: boolean
    createdAt: Date
    updatedAt: Date
    files?: TodoFile[]
    tags?: Tag[]
}

export interface TodoFile {
    id: string
    filename: string
    path: string
    mimetype: string
    size: number
    todoId: string
    createdAt: Date
    updatedAt: Date
}

export interface Tag {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
}

export interface CreateTodoInput {
    title: string
    description?: string
    tags?: string[]
}

export interface UpdateTodoInput {
    title?: string
    description?: string
    completed?: boolean
    tags?: string[]
}

export interface UploadFileInput {
    todoId: string
    file: File
}
