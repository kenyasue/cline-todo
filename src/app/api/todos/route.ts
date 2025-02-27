import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CreateTodoInput, UpdateTodoInput } from '@/types';

// GET /api/todos - Get all todos
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tagFilter = searchParams.get('tag');

        let whereClause = {};

        if (tagFilter) {
            whereClause = {
                tags: {
                    some: {
                        tag: {
                            name: tagFilter
                        }
                    }
                }
            };
        }

        const todos = await prisma.todo.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
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
        const transformedTodos = todos.map(todo => ({
            ...todo,
            tags: todo.tags.map(todoTag => todoTag.tag)
        }));

        return NextResponse.json(transformedTodos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        return NextResponse.json(
            { error: 'Failed to fetch todos' },
            { status: 500 }
        );
    }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
    try {
        const body: CreateTodoInput = await request.json();

        if (!body.title || body.title.trim() === '') {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        // Process tags if provided
        const tagConnections = [];
        if (body.tags && body.tags.length > 0) {
            for (const tagName of body.tags) {
                if (tagName.trim() !== '') {
                    // Find or create the tag
                    const tag = await prisma.tag.upsert({
                        where: { name: tagName.trim() },
                        update: {},
                        create: { name: tagName.trim() }
                    });

                    tagConnections.push({
                        tag: {
                            connect: { id: tag.id }
                        }
                    });
                }
            }
        }

        const todo = await prisma.todo.create({
            data: {
                title: body.title.trim(),
                description: body.description?.trim(),
                tags: {
                    create: tagConnections
                }
            },
            include: {
                files: true,
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });

        // Transform the data to match our expected Todo type with tags array
        const transformedTodo = {
            ...todo,
            tags: todo.tags.map(todoTag => todoTag.tag)
        };

        return NextResponse.json(transformedTodo, { status: 201 });
    } catch (error) {
        console.error('Error creating todo:', error);
        return NextResponse.json(
            { error: 'Failed to create todo' },
            { status: 500 }
        );
    }
}
