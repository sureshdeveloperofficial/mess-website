import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';

const BUCKET = process.env.BUCKET_NAME || 'rythmtechnical';
const ENDPOINT = process.env.ENDPOINT || 'https://sgp1.digitaloceanspaces.com';
const FOLDER = process.env.FOLDER_NAME || 'mess_website';

// DigitalOcean Spaces S3 Client
export const s3Client = new S3Client({
    endpoint: ENDPOINT,
    region: 'sgp1',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY || '',
        secretAccessKey: process.env.SECRET_KEY || '',
    },
    forcePathStyle: false, // subdomain style for DO Spaces
});

/**
 * Uploads a file Buffer directly to DigitalOcean Spaces
 * @param fileBuffer Buffer of the file
 * @param fileName Base filename or custom relative path
 * @param mimeType Optional content-type
 * @param subFolder Optional subfolder inside mess_website/
 * @returns Public URL of the uploaded asset in DigitalOcean Spaces
 */
export async function uploadToSpaces(
    fileBuffer: Buffer,
    fileName: string,
    mimeType?: string,
    subFolder: string = ''
): Promise<string> {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folderPath = subFolder ? `${FOLDER}/${subFolder}` : FOLDER;
    const key = `${folderPath}/${cleanFileName}`.replace(/\/+/g, '/');

    const contentType = mimeType || mime.lookup(fileName) || 'application/octet-stream';

    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fileBuffer,
        ACL: 'public-read',
        ContentType: contentType,
        ContentDisposition: 'inline',
    });

    await s3Client.send(command);

    // Format public URL: https://{BUCKET}.sgp1.digitaloceanspaces.com/{key}
    const cleanEndpoint = ENDPOINT.replace(/^https?:\/\//, '');
    return `https://${BUCKET}.${cleanEndpoint}/${key}`;
}

export default s3Client;
