const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = 'bharatseva-voice-signatures';

const uploadVoiceSignature = async (req, res) => {
    try {
        // req.file comes from multer middleware
        if (!req.file) {
            return res.status(400).json({ error: 'Audio file is required' });
        }
        const audioBuffer = req.file.buffer;
        const fileKey = `signatures/${uuidv4()}.wav`;

        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: fileKey,
            Body: audioBuffer,
            ContentType: 'audio/wav',
        }));

        // Presigned URL valid for 7 years
        const presignedUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({ Bucket: BUCKET, Key: fileKey }),
            { expiresIn: 60 * 60 * 24 * 365 * 7 }
        );

        return res.status(200).json({
            presignedUrl,
            qrCodeData: presignedUrl,
            fileKey,
            expiresAt: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        });

    } catch (error) {
        console.error('Voice signature upload error:', error);
        return res.status(500).json({ error: 'Could not save voice signature' });
    }
};

module.exports = { uploadVoiceSignature };
