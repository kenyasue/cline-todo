import { useState } from 'react';
import { Tag, TodoFile } from '@/types';
import Link from 'next/link';

interface TodoItemProps {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    files?: TodoFile[];
    tags?: Tag[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, newTitle: string, newDescription?: string, newTags?: string[]) => void;
    onViewDetails: (id: string) => void;
    onTagClick?: (tagName: string) => void;
}

export default function TodoItem({
    id,
    title,
    description,
    completed,
    files = [],
    tags = [],
    onToggle,
    onDelete,
    onEdit,
    onViewDetails,
    onTagClick
}: TodoItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [editedDescription, setEditedDescription] = useState(description || '');
    const [tagInput, setTagInput] = useState('');
    const [editedTags, setEditedTags] = useState<string[]>(tags.map(tag => tag.name));

    const handleEdit = () => {
        if (editedTitle.trim() !== '') {
            onEdit(id, editedTitle, editedDescription, editedTags);
            setIsEditing(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() !== '' && !editedTags.includes(tagInput.trim())) {
            setEditedTags([...editedTags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <li className="border-b border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-secondary/20">
            {isEditing ? (
                <div className="p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            className="input flex-1"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                            autoFocus
                            placeholder="Title"
                        />
                    </div>
                    <div>
                        <textarea
                            className="input w-full h-24"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            placeholder="Description (optional)"
                        />
                    </div>
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
                        {editedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {editedTags.map((tag, index) => (
                                    <div key={index} className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded-full flex items-center text-sm">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditedTitle(title);
                                setEditedDescription(description || '');
                                setEditedTags(tags.map(tag => tag.name));
                            }}
                            className="btn btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleEdit}
                            className="btn btn-primary"
                        >
                            Save
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3 flex-1">
                            <input
                                type="checkbox"
                                checked={completed}
                                onChange={() => onToggle(id)}
                                className="h-5 w-5 text-blue-500 rounded focus:ring-blue-500"
                            />
                            <div>
                                <h3 className={`text-lg font-medium dark:text-dark-text ${completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                                    {title}
                                </h3>
                                {description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                                        {description}
                                    </p>
                                )}
                                {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {tags.map(tag => (
                                            <span
                                                key={tag.id}
                                                className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs px-2 py-0.5 rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800"
                                                onClick={() => onTagClick && onTagClick(tag.name)}
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {files.length > 0 && (
                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {files.length} file{files.length !== 1 ? 's' : ''} attached
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => onViewDetails(id)}
                                className="btn btn-secondary text-sm"
                            >
                                View
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-secondary text-sm"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => onDelete(id)}
                                className="btn btn-danger text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </li>
    );
}
