import { useState } from 'react';

interface TodoFormProps {
    onAdd: (title: string, description?: string, tags?: string[]) => void;
}

export default function TodoForm({ onAdd }: TodoFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [showDescription, setShowDescription] = useState(false);
    const [showTags, setShowTags] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() !== '') {
            onAdd(title, description, tags.length > 0 ? tags : undefined);
            setTitle('');
            setDescription('');
            setTagInput('');
            setTags([]);
            setShowDescription(false);
            setShowTags(false);
        }
    };

    const handleAddTag = () => {
        if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-6 bg-white dark:bg-dark-card p-4 rounded-lg shadow">
            <div className="space-y-3">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        placeholder="Add a new todo..."
                        className="input flex-1"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className="flex space-x-1">
                        <button
                            type="button"
                            onClick={() => setShowDescription(!showDescription)}
                            className="btn btn-secondary"
                            title={showDescription ? "Hide description" : "Add description"}
                        >
                            {showDescription ? "−" : "+"} Description
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowTags(!showTags)}
                            className="btn btn-secondary"
                            title={showTags ? "Hide tags" : "Add tags"}
                        >
                            {showTags ? "−" : "+"} Tags
                        </button>
                    </div>
                </div>

                {showDescription && (
                    <div>
                        <textarea
                            placeholder="Add a description (optional)"
                            className="input w-full h-24"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                )}

                {showTags && (
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
                                {tags.map((tag, index) => (
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
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Add Todo
                    </button>
                </div>
            </div>
        </form>
    );
}
