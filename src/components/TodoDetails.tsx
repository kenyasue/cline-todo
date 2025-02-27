import { useState, useRef, ChangeEvent } from 'react';
import { Todo, TodoFile, Tag } from '@/types';

interface TodoDetailsProps {
    todo: Todo;
    onClose: () => void;
    onEdit: (id: string, newTitle: string, newDescription?: string, newTags?: string[]) => void;
    onDeleteFile: (fileId: string) => Promise<boolean>;
    onUploadFile: (todoId: string, file: File) => Promise<TodoFile | null>;
}

export default function TodoDetails({ todo, onClose, onEdit, onDeleteFile, onUploadFile }: TodoDetailsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(todo.title);
    const [description, setDescription] = useState(todo.description || '');
    const [files, setFiles] = useState<TodoFile[]>(todo.files || []);
    const [tags, setTags] = useState<Tag[]>(todo.tags || []);
    const [tagInput, setTagInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleEdit = () => {
        if (title.trim() !== '') {
            onEdit(todo.id, title, description, tags.map(tag => tag.name));
            setIsEditing(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() !== '' && !tags.some(tag => tag.name === tagInput.trim())) {
            // Create a temporary tag object with a unique ID
            // The actual tag ID will be assigned by the server
            const newTag: Tag = {
                id: `temp-${Date.now()}`,
                name: tagInput.trim(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            setTags([...tags, newTag]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag.name !== tagToRemove));
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setIsUploading(true);

        try {
            const uploadedFiles = [];

            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                const result = await onUploadFile(todo.id, file);

                if (result) {
                    uploadedFiles.push(result);
                }
            }

            setFiles([...files, ...uploadedFiles]);
        } catch (error) {
            console.error('Error uploading files:', error);
        } finally {
            setIsUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteFile = async (fileId: string) => {
        const success = await onDeleteFile(fileId);
        if (success) {
            setFiles(files.filter(file => file.id !== fileId));
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' bytes';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-dark-text">Todo Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto dark:text-dark-text">
                    {isEditing ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    className="input w-full h-32"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Description (optional)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tags
                                </label>
                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Add tags..."
                                            className="input flex-1"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagInputKeyDown}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddTag}
                                            className="btn btn-secondary"
                                        >
                                            Add Tag
                                        </button>
                                    </div>
                                    {tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {tags.map((tag) => (
                                                <div key={tag.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center text-sm">
                                                    {tag.name}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag.name)}
                                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</h3>
                                <p className="mt-1">{todo.title}</p>
                            </div>

                            {todo.description && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</h3>
                                    <p className="mt-1 whitespace-pre-wrap">{todo.description}</p>
                                </div>
                            )}

                            {todo.tags && todo.tags.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h3>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {todo.tags.map(tag => (
                                            <span
                                                key={tag.id}
                                                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs px-2 py-0.5 rounded-full"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                                <p className="mt-1">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${todo.completed
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                                        }`}>
                                        {todo.completed ? 'Completed' : 'In Progress'}
                                    </span>
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</h3>
                                <p className="mt-1">
                                    {new Date(todo.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Files</h3>
                            <div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    multiple
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="btn btn-secondary text-sm"
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Files'}
                                </button>
                            </div>
                        </div>

                        {files.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No files attached</p>
                        ) : (
                            <ul className="border dark:border-dark-border rounded-md divide-y dark:divide-dark-border">
                                {files.map(file => {
                                    const fileUrl = `/uploads/${file.filename.split('/').pop()}`;
                                    const isImage = file.mimetype.startsWith('image/');

                                    // Determine file icon based on mimetype
                                    const getFileIcon = () => {
                                        if (file.mimetype.includes('pdf')) return '📕';
                                        if (file.mimetype.includes('word') || file.mimetype.includes('document')) return '📝';
                                        if (file.mimetype.includes('excel') || file.mimetype.includes('spreadsheet')) return '📊';
                                        if (file.mimetype.includes('presentation') || file.mimetype.includes('powerpoint')) return '📊';
                                        if (file.mimetype.includes('text')) return '📄';
                                        if (file.mimetype.includes('zip') || file.mimetype.includes('compressed')) return '🗜️';
                                        if (file.mimetype.includes('audio')) return '🎵';
                                        if (file.mimetype.includes('video')) return '🎬';
                                        return '📄'; // Default icon
                                    };

                                    return (
                                        <li key={file.id} className="p-3 flex justify-between items-center">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                                                    {isImage ? (
                                                        <img
                                                            src={fileUrl}
                                                            alt={file.filename}
                                                            className="w-10 h-10 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="text-2xl text-gray-400">
                                                            {getFileIcon()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">
                                                        {file.filename}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <a
                                                    href={fileUrl}
                                                    download={file.filename}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteFile(file.id)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t dark:border-dark-border flex justify-end space-x-2">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setTitle(todo.title);
                                    setDescription(todo.description || '');
                                    setTags(todo.tags || []);
                                }}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEdit}
                                className="btn btn-primary"
                            >
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary"
                        >
                            Edit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
