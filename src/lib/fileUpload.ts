import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure upload directory
export const uploadDir = path.join(process.cwd(), 'public', 'uploads');
export const uploadUrl = '/uploads';

// Ensure upload directory exists
export const ensureUploadDir = async () => {
    try {
        await fs.access(uploadDir);
    } catch (error) {
        await fs.mkdir(uploadDir, { recursive: true });
    }
};

// Save a file from a base64 string
export const saveFileFromBase64 = async (
    base64Data: string,
    filename: string
): Promise<{ path: string; url: string; size: number }> => {
    await ensureUploadDir();

    // Extract the actual base64 data (remove data:image/jpeg;base64, etc.)
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
    }

    const fileType = matches[1];
    const data = matches[2];
    const buffer = Buffer.from(data, 'base64');

    // Generate a unique filename
    const extension = filename.split('.').pop() ||
        fileType.split('/')[1] ||
        'bin';

    const uniqueFilename = `${uuidv4()}.${extension}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Save the file
    await fs.writeFile(filePath, buffer);

    return {
        path: filePath,
        url: `${uploadUrl}/${uniqueFilename}`,
        size: buffer.length
    };
};

// Delete file
export const deleteFile = async (filePath: string): Promise<boolean> => {
    try {
        // Make sure the file is in our uploads directory to prevent directory traversal
        const normalizedPath = path.normalize(filePath);
        if (!normalizedPath.startsWith(uploadDir)) {
            console.error('Attempted to delete file outside of uploads directory');
            return false;
        }

        await fs.unlink(filePath);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};
