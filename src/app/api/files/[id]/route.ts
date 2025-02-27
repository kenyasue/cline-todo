import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteFile } from '@/lib/fileUpload';

// DELETE /api/files/[id] - Delete a file
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Check if file exists
        const todoFile = await prisma.todoFile.findUnique({
            where: { id },
        });

        if (!todoFile) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        // Delete file from storage
        await deleteFile(todoFile.path);

        // Delete file record from database
        await prisma.todoFile.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}
