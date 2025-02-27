import { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import { Todo } from '@/types';

interface TodoListProps {
    todos: Todo[];
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string, newTitle: string, newDescription?: string, newTags?: string[]) => void;
    onViewDetails: (id: string) => void;
    onFilterByTag?: (tagName: string | null) => void;
    activeTagFilter?: string | null;
}

export default function TodoList({
    todos,
    onToggle,
    onDelete,
    onEdit,
    onViewDetails,
    onFilterByTag,
    activeTagFilter
}: TodoListProps) {
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    // Extract unique tags from todos
    useEffect(() => {
        const tagSet = new Set<string>();
        todos.forEach(todo => {
            if (todo.tags) {
                todo.tags.forEach(tag => {
                    tagSet.add(tag.name);
                });
            }
        });
        setAvailableTags(Array.from(tagSet).sort());
    }, [todos]);

    if (todos.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                {activeTagFilter
                    ? `No todos with tag "${activeTagFilter}". Try a different filter or add a new todo.`
                    : 'No todos yet. Add one above!'}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {availableTags.length > 0 && onFilterByTag && (
                <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by tag:</h3>
                    <div className="flex flex-wrap gap-2">
                        {activeTagFilter && (
                            <button
                                onClick={() => onFilterByTag(null)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-dark-secondary dark:hover:bg-gray-600 dark:text-dark-text text-xs px-3 py-1 rounded-full"
                            >
                                Clear filter
                            </button>
                        )}
                        {availableTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => onFilterByTag(tag)}
                                className={`text-xs px-3 py-1 rounded-full ${activeTagFilter === tag
                                    ? 'bg-blue-500 text-white dark:bg-blue-700'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <ul className="bg-white dark:bg-dark-card rounded-lg shadow overflow-hidden">
                {todos.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        id={todo.id}
                        title={todo.title}
                        description={todo.description}
                        completed={todo.completed}
                        files={todo.files}
                        tags={todo.tags}
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onViewDetails={onViewDetails}
                        onTagClick={onFilterByTag}
                    />
                ))}
            </ul>
        </div>
    );
}
