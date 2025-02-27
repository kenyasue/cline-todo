'use client';

import { useState, useEffect } from 'react';
import TodoList from '@/components/TodoList';
import TodoForm from '@/components/TodoForm';
import TodoDetails from '@/components/TodoDetails';
import { Todo, TodoFile } from '@/types';

export default function Home() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
    const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);

    // Fetch todos on component mount or when tag filter changes
    useEffect(() => {
        const fetchTodos = async () => {
            try {
                setLoading(true);
                const url = activeTagFilter
                    ? `/api/todos?tag=${encodeURIComponent(activeTagFilter)}`
                    : '/api/todos';

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Failed to fetch todos');
                }
                const data = await response.json();
                setTodos(data);
                setError(null);
            } catch (err) {
                setError('Failed to load todos. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTodos();
    }, [activeTagFilter]);

    // Add a new todo
    const handleAddTodo = async (title: string, description?: string, tags?: string[]) => {
        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description, tags }),
            });

            if (!response.ok) {
                throw new Error('Failed to add todo');
            }

            const newTodo = await response.json();
            setTodos([newTodo, ...todos]);
        } catch (err) {
            setError('Failed to add todo. Please try again.');
            console.error(err);
        }
    };

    // Toggle todo completion status
    const handleToggleTodo = async (id: string) => {
        try {
            const todoToUpdate = todos.find(todo => todo.id === id);
            if (!todoToUpdate) return;

            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    completed: !todoToUpdate.completed,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update todo');
            }

            const updatedTodo = await response.json();
            setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));

            // Update selected todo if it's the one being toggled
            if (selectedTodo && selectedTodo.id === id) {
                setSelectedTodo(updatedTodo);
            }
        } catch (err) {
            setError('Failed to update todo. Please try again.');
            console.error(err);
        }
    };

    // Edit todo title, description, and tags
    const handleEditTodo = async (id: string, newTitle: string, newDescription?: string, newTags?: string[]) => {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTitle,
                    description: newDescription,
                    tags: newTags
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update todo');
            }

            const updatedTodo = await response.json();
            setTodos(todos.map(todo => (todo.id === id ? updatedTodo : todo)));

            // Update selected todo if it's the one being edited
            if (selectedTodo && selectedTodo.id === id) {
                setSelectedTodo(updatedTodo);
            }
        } catch (err) {
            setError('Failed to update todo. Please try again.');
            console.error(err);
        }
    };

    // Handle filtering by tag
    const handleFilterByTag = (tagName: string | null) => {
        setActiveTagFilter(tagName);
    };

    // Delete a todo
    const handleDeleteTodo = async (id: string) => {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete todo');
            }

            setTodos(todos.filter(todo => todo.id !== id));

            // Close details modal if the deleted todo was selected
            if (selectedTodo && selectedTodo.id === id) {
                setSelectedTodo(null);
            }
        } catch (err) {
            setError('Failed to delete todo. Please try again.');
            console.error(err);
        }
    };

    // View todo details
    const handleViewTodoDetails = async (id: string) => {
        try {
            const response = await fetch(`/api/todos/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch todo details');
            }
            const todoDetails = await response.json();
            setSelectedTodo(todoDetails);
        } catch (err) {
            setError('Failed to load todo details. Please try again.');
            console.error(err);
        }
    };

    // Upload file to a todo
    const handleUploadFile = async (todoId: string, file: File): Promise<TodoFile | null> => {
        try {
            // Convert file to base64
            const base64File = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
            });

            const response = await fetch('/api/files', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    todoId,
                    filename: file.name,
                    mimetype: file.type,
                    file: base64File,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const uploadedFile = await response.json();

            // Update the todos list with the new file
            const updatedTodos = todos.map(todo => {
                if (todo.id === todoId) {
                    return {
                        ...todo,
                        files: [...(todo.files || []), uploadedFile],
                    };
                }
                return todo;
            });

            setTodos(updatedTodos);

            // Update selected todo if it's the one being modified
            if (selectedTodo && selectedTodo.id === todoId) {
                const updatedTodo = updatedTodos.find(t => t.id === todoId);
                if (updatedTodo) {
                    setSelectedTodo(updatedTodo);
                }
            }

            return uploadedFile;
        } catch (err) {
            setError('Failed to upload file. Please try again.');
            console.error(err);
            return null;
        }
    };

    // Delete a file
    const handleDeleteFile = async (fileId: string): Promise<boolean> => {
        try {
            const response = await fetch(`/api/files/${fileId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            // Update todos list by removing the deleted file
            const updatedTodos = todos.map(todo => {
                if (todo.files && todo.files.some(file => file.id === fileId)) {
                    return {
                        ...todo,
                        files: todo.files.filter(file => file.id !== fileId),
                    };
                }
                return todo;
            });

            setTodos(updatedTodos);

            // Update selected todo if it contains the deleted file
            if (selectedTodo && selectedTodo.files && selectedTodo.files.some(file => file.id === fileId)) {
                const updatedTodo = updatedTodos.find(t => t.id === selectedTodo.id);
                if (updatedTodo) {
                    setSelectedTodo(updatedTodo);
                }
            }

            return true;
        } catch (err) {
            setError('Failed to delete file. Please try again.');
            console.error(err);
            return false;
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold mb-2">Todo App</h1>
                <p className="text-gray-600">Manage your tasks with ease</p>
            </div>

            <TodoForm onAdd={handleAddTodo} />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <TodoList
                    todos={todos}
                    onToggle={handleToggleTodo}
                    onDelete={handleDeleteTodo}
                    onEdit={handleEditTodo}
                    onViewDetails={handleViewTodoDetails}
                    onFilterByTag={handleFilterByTag}
                    activeTagFilter={activeTagFilter}
                />
            )}

            {selectedTodo && (
                <TodoDetails
                    todo={selectedTodo}
                    onClose={() => setSelectedTodo(null)}
                    onEdit={handleEditTodo}
                    onDeleteFile={handleDeleteFile}
                    onUploadFile={handleUploadFile}
                />
            )}
        </div>
    );
}
