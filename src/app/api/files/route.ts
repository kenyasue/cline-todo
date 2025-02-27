import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveFileFromBase64, deleteFile } from '@/lib/fileUpload';

// POST /api/files - Upload a file
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.todoId || !body.file || !body.filename) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if todo exists
        const todo = await prisma.todo.findUnique({
            where: { id: body.todoId },
        });

        if (!todo) {
            return NextResponse.json(
                { error: 'Todo not found' },
                { status: 404 }
            );
        }

        // Save the file
        const fileInfo = await saveFileFromBase64(body.file, body.filename);

        // Create file record in database
        const todoFile = await prisma.todoFile.create({
            data: {
                filename: body.filename,
                path: fileInfo.path,
                mimetype: body.mimetype || 'application/octet-stream',
                size: fileInfo.size,
                todoId: body.todoId,
            },
        });

        return NextResponse.json({
            id: todoFile.id,
            filename: todoFile.filename,
            url: fileInfo.url,
            size: todoFile.size,
            mimetype: todoFile.mimetype,
            createdAt: todoFile.createdAt,
        }, { status: 201 });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
