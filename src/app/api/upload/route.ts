import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import cloudinary from '@/utils/cloudinary';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const result: any = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'restaurant_assets',
                    resource_type: 'auto',
                    // Use preservation flags to maintain quality
                    quality: 'auto:best',
                    flags: 'attachment', // subtle way to suggest original fidelity
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        // We return only the public_id and version or relative path if you prefer.
        // For simplicity and consistent with the base URL logic, we can return the relative path.
        // Example: 'v123456789/folder/image.png' or just 'restaurant_assets/xyz'
        const relativePath = result.public_id; // Usually enough if using public URL construction

        return NextResponse.json({
            success: true,
            path: relativePath,
            secure_url: result.secure_url
        });

    } catch (error: any) {
        console.error('Upload Error:', error);
        const errorMessage = error.message || 'Upload failed';
        return NextResponse.json({ error: errorMessage }, { status: error.http_code || 500 });
    }
}
