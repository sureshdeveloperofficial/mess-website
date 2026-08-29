const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

async function test() {
    console.log('Testing DigitalOcean Spaces Connection...');
    console.log('Bucket:', process.env.BUCKET_NAME);
    console.log('Endpoint:', process.env.ENDPOINT);
    console.log('Folder:', process.env.FOLDER_NAME);

    const s3 = new S3Client({
        endpoint: process.env.ENDPOINT,
        region: 'sgp1',
        credentials: {
            accessKeyId: process.env.ACCESS_KEY,
            secretAccessKey: process.env.SECRET_KEY,
        },
        forcePathStyle: false,
    });

    const testKey = `${process.env.FOLDER_NAME}/test_connection.txt`;
    const putCmd = new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: testKey,
        Body: Buffer.from('DigitalOcean Spaces connection test successful for mess_website! Timestamp: ' + new Date().toISOString()),
        ACL: 'public-read',
        ContentType: 'text/plain',
    });

    await s3.send(putCmd);
    console.log('Successfully uploaded test object to DO Spaces!');
    const url = `https://${process.env.BUCKET_NAME}.sgp1.digitaloceanspaces.com/${testKey}`;
    console.log('Public URL:', url);
}

test().catch(err => {
    console.error('Test failed:', err);
});
