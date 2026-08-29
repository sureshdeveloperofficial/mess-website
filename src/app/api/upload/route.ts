import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { uploadToSpaces } from '@/utils/s3';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        
        // Collect all files from 'files' or 'file' form fields
        let files: File[] = [];
        const filesFromList = formData.getAll('files') as File[];
        const fileFromSingle = formData.getAll('file') as File[];

        if (filesFromList && filesFromList.length > 0) {
            files = filesFromList.filter(f => f && typeof f === 'object' && 'arrayBuffer' in f);
        } else if (fileFromSingle && fileFromSingle.length > 0) {
            files = fileFromSingle.filter(f => f && typeof f === 'object' && 'arrayBuffer' in f);
        }

        if (files.length === 0) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Upload all files in parallel to DigitalOcean Spaces
        const uploadPromises = files.map(async (file, idx) => {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const originalName = file.name || `image_${idx}.png`;
            const ext = originalName.includes('.') ? originalName.split('.').pop() : 'png';
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const fileName = `upload_${timestamp}_${idx}_${randomStr}.${ext}`;

            const publicUrl = await uploadToSpaces(buffer, fileName, file.type);
            return {
                name: originalName,
                url: publicUrl
            };
        });

        const results = await Promise.all(uploadPromises);
        const urls = results.map(r => r.url);

        return NextResponse.json({
            success: true,
            path: urls[0],
            secure_url: urls[0],
            url: urls[0],
            urls: urls,
            files: results,
            count: urls.length
        });

    } catch (error: any) {
        console.error('DigitalOcean Spaces Multi-Upload Error:', error);
        const errorMessage = error.message || 'Upload failed';
        return NextResponse.json({ error: errorMessage }, { status: error.http_code || 500 });
    }
}
