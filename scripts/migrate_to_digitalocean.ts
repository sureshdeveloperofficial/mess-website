import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

const prisma = new PrismaClient();

const BUCKET = process.env.BUCKET_NAME || 'rythmtechnical';
const ENDPOINT = process.env.ENDPOINT || 'https://sgp1.digitaloceanspaces.com';
const FOLDER = process.env.FOLDER_NAME || 'mess_website';

const s3 = new S3Client({
    endpoint: ENDPOINT,
    region: 'sgp1',
    credentials: {
        accessKeyId: process.env.ACCESS_KEY || '',
        secretAccessKey: process.env.SECRET_KEY || '',
    },
    forcePathStyle: false,
});

const cleanEndpoint = ENDPOINT.replace(/^https?:\/\//, '');
const urlMap = new Map<string, string>(); // maps local/cloudinary URL to DO Spaces URL

async function uploadBuffer(buffer: Buffer, key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ACL: 'public-read',
        ContentType: contentType,
        ContentDisposition: 'inline',
    });

    await s3.send(command);
    return `https://${BUCKET}.${cleanEndpoint}/${key}`;
}

async function uploadLocalDirectory(dirPath: string, baseDir: string) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
            await uploadLocalDirectory(fullPath, baseDir);
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.ico'].includes(ext)) {
                const relativeToPublic = path.relative(baseDir, fullPath).replace(/\\/g, '/');
                const key = `${FOLDER}/${relativeToPublic}`;
                const fileBuffer = fs.readFileSync(fullPath);
                const contentType = mime.lookup(fullPath) || 'application/octet-stream';

                try {
                    const doUrl = await uploadBuffer(fileBuffer, key, contentType);
                    console.log(`✓ Uploaded: ${relativeToPublic} -> ${doUrl}`);
                    urlMap.set(`/${relativeToPublic}`, doUrl);
                } catch (err: any) {
                    console.error(`✗ Failed to upload ${relativeToPublic}:`, err.message);
                }
            }
        }
    }
}

async function downloadAndUploadCloudinary(cloudinaryUrl: string): Promise<string> {
    if (urlMap.has(cloudinaryUrl)) {
        return urlMap.get(cloudinaryUrl)!;
    }

    try {
        console.log(`Downloading Cloudinary asset: ${cloudinaryUrl}`);
        const res = await fetch(cloudinaryUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arrayBuf = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);

        const fileName = path.basename(new URL(cloudinaryUrl).pathname) || `asset_${Date.now()}.png`;
        const key = `${FOLDER}/migrated_assets/${fileName}`;
        const contentType = res.headers.get('content-type') || mime.lookup(fileName) || 'image/png';

        const doUrl = await uploadBuffer(buffer, key, contentType);
        console.log(`✓ Cloudinary migrated to DO Spaces: ${doUrl}`);
        urlMap.set(cloudinaryUrl, doUrl);
        return doUrl;
    } catch (err: any) {
        console.error(`✗ Failed to migrate Cloudinary URL (${cloudinaryUrl}):`, err.message);
        return cloudinaryUrl;
    }
}

function mapUrl(url: string): string {
    if (!url) return url;
    if (urlMap.has(url)) return urlMap.get(url)!;

    // Check if relative path matches
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith('/')) {
        for (const [localPath, doUrl] of urlMap.entries()) {
            if (localPath.toLowerCase() === cleanUrl.toLowerCase()) {
                return doUrl;
            }
        }
    }
    return url;
}

async function main() {
    console.log('====================================================');
    console.log('DIGITALOCEAN SPACES FULL MEDIA MIGRATION');
    console.log('Bucket:', BUCKET);
    console.log('Endpoint:', ENDPOINT);
    console.log('Folder:', FOLDER);
    console.log('====================================================\n');

    // 1. Upload all local images from public/images
    const publicImagesDir = path.join(process.cwd(), 'public');
    console.log(`1. Uploading local images from ${publicImagesDir}...`);
    await uploadLocalDirectory(publicImagesDir, publicImagesDir);
    console.log(`Uploaded ${urlMap.size} local assets.\n`);

    // 2. Scan and Migrate Database Settings
    console.log('2. Updating Database Settings...');
    const settings = await prisma.setting.findMany();

    for (const setting of settings) {
        let val = setting.value;

        // Check if value is a JSON array/object or single URL
        if (setting.key === 'gallery_items') {
            try {
                const items = JSON.parse(val);
                if (Array.isArray(items)) {
                    for (const item of items) {
                        if (item.src) {
                            if (item.src.includes('cloudinary.com')) {
                                item.src = await downloadAndUploadCloudinary(item.src);
                            } else {
                                item.src = mapUrl(item.src);
                            }
                        }
                    }
                    val = JSON.stringify(items);
                }
            } catch (e) {}
        } else if (setting.key === 'hero_slider_images') {
            try {
                const slides = JSON.parse(val);
                if (Array.isArray(slides)) {
                    const newSlides = [];
                    for (let slide of slides) {
                        if (slide.includes('cloudinary.com')) {
                            slide = await downloadAndUploadCloudinary(slide);
                        } else {
                            slide = mapUrl(slide);
                        }
                        newSlides.push(slide);
                    }
                    val = JSON.stringify(newSlides);
                }
            } catch (e) {}
        } else if (val.includes('cloudinary.com')) {
            val = await downloadAndUploadCloudinary(val);
        } else if (val.startsWith('/images/')) {
            val = mapUrl(val);
        }

        if (val !== setting.value) {
            await prisma.setting.update({
                where: { id: setting.id },
                data: { value: val }
            });
            console.log(`✓ Updated setting: ${setting.key}`);
        }
    }

    // 3. Scan and Migrate FoodItems
    console.log('\n3. Updating Food Items...');
    const foodItems = await prisma.foodItem.findMany();
    let updatedFoodCount = 0;
    for (const item of foodItems) {
        if (item.image) {
            let newImg = item.image;
            if (item.image.includes('cloudinary.com')) {
                newImg = await downloadAndUploadCloudinary(item.image);
            } else if (item.image.startsWith('/images/')) {
                newImg = mapUrl(item.image);
            }

            if (newImg !== item.image) {
                await prisma.foodItem.update({
                    where: { id: item.id },
                    data: { image: newImg }
                });
                updatedFoodCount++;
            }
        }
    }
    console.log(`✓ Updated ${updatedFoodCount} FoodItem records.`);

    console.log('\n====================================================');
    console.log('MIGRATION COMPLETED SUCCESSFULLY TO DIGITALOCEAN SPACES!');
    console.log('====================================================');
}

main()
    .catch((err) => {
        console.error('Migration failed:', err);
    })
    .finally(() => {
        prisma.$disconnect();
    });
