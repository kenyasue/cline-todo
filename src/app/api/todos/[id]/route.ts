import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateTodoInput } from '@/types';

// GET /api/todos/[id] - Get a specific todo
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const todo = await prisma.todo.findUnique({
            where: { id },
            include: {
                files: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            },
        });

        if (!todo) {
            return NextResponse.json(
                { error: 'Todo not found' },
                { status: 404 }
            );
        }

        // Transform the data to match our expected Todo type with tags array
        const transformedTodo = {
            ...todo,
            tags: todo.tags.map(todoTag => todoTag.tag)
        };

        return NextResponse.json(transformedTodo);
    } catch (error) {
        console.error('Error fetching todo:', error);
        return NextResponse.json(
            { error: 'Failed to fetch todo' },
            { status: 500 }
        );
    }
}

// PUT /api/todos/[id] - Update a todo
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body: UpdateTodoInput = await request.json();

        // Check if todo exists
        const existingTodo = await prisma.todo.findUnique({
            where: { id },
        });

        if (!existingTodo) {
            return NextResponse.json(
                { error: 'Todo not found' },
                { status: 404 }
            );
        }

        // Handle tag updates if provided
        if (body.tags !== undefined) {
            // First, delete all existing tag connections
            await prisma.todoTag.deleteMany({
                where: { todoId: id }
            });

            // Then create new connections for each tag
            if (body.tags.length > 0) {
                for (const tagName of body.tags) {
                    if (tagName.trim() !== '') {
                        // Find or create the tag
                        const tag = await prisma.tag.upsert({
                            where: { name: tagName.trim() },
                            update: {},
                            create: { name: tagName.trim() }
                        });

                        // Create the connection
                        await prisma.todoTag.create({
                            data: {
                                todoId: id,
                                tagId: tag.id
                            }
                        });
                    }
                }
            }
        }

        // Update todo
        const updatedTodo = await prisma.todo.update({
            where: { id },
            data: {
                ...(body.title !== undefined && { title: body.title.trim() }),
                ...(body.description !== undefined && { description: body.description.trim() }),
                ...(body.completed !== undefined && { completed: body.completed }),
            },
            include: {
                files: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            },
        });

        // Transform the data to match our expected Todo type with tags array
        const transformedTodo = {
            ...updatedTodo,
            tags: updatedTodo.tags.map(todoTag => todoTag.tag)
        };

        return NextResponse.json(transformedTodo);
    } catch (error) {
        console.error('Error updating todo:', error);
        return NextResponse.json(
            { error: 'Failed to update todo' },
            { status: 500 }
        );
    }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Check if todo exists
        const existingTodo = await prisma.todo.findUnique({
            where: { id },
            include: {
                files: true,
            },
        });

        if (!existingTodo) {
            return NextResponse.json(
                { error: 'Todo not found' },
                { status: 404 }
            );
        }

        // Delete todo (will cascade delete files due to relation)
        await prisma.todo.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting todo:', error);
        return NextResponse.json(
            { error: 'Failed to delete todo' },
            { status: 500 }
        );
    }
}
