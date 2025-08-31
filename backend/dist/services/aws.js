import AWS from 'aws-sdk';
import { integrationConfig } from '../config/integrations';
export class AWSService {
    constructor() {
        this.enabled = integrationConfig.aws.enabled;
        if (this.enabled) {
            AWS.config.update({
                accessKeyId: integrationConfig.aws.accessKeyId,
                secretAccessKey: integrationConfig.aws.secretAccessKey,
                region: integrationConfig.aws.region,
            });
            this.s3 = new AWS.S3();
        }
    }
    static getInstance() {
        if (!AWSService.instance) {
            AWSService.instance = new AWSService();
        }
        return AWSService.instance;
    }
    async uploadFile(file, fileName, folder = 'uploads', contentType) {
        if (!this.enabled) {
            throw new Error('AWS S3 is not configured');
        }
        const key = `${folder}/${Date.now()}-${fileName}`;
        const params = {
            Bucket: integrationConfig.aws.s3Bucket,
            Key: key,
            Body: file,
            ContentType: contentType || 'application/octet-stream',
            ACL: 'public-read',
            Metadata: {
                uploadedAt: new Date().toISOString(),
                originalName: fileName,
            },
        };
        try {
            const result = await this.s3.upload(params).promise();
            return {
                url: result.Location,
                key: result.Key,
                bucket: result.Bucket,
                size: file.length,
                mimeType: contentType || 'application/octet-stream',
            };
        }
        catch (error) {
            console.error('[AWS S3] Upload error:', error);
            throw new Error('Failed to upload file to S3');
        }
    }
    async uploadMenuImage(file, fileName, restaurantId) {
        const folder = `menu-images/${restaurantId}`;
        return this.uploadFile(file, fileName, folder, 'image/jpeg');
    }
    async uploadRestaurantLogo(file, fileName, restaurantId) {
        const folder = `logos/${restaurantId}`;
        return this.uploadFile(file, fileName, folder, 'image/png');
    }
    async uploadQRCode(file, fileName, restaurantId) {
        const folder = `qr-codes/${restaurantId}`;
        return this.uploadFile(file, fileName, folder, 'image/png');
    }
    async deleteFile(key) {
        if (!this.enabled) {
            throw new Error('AWS S3 is not configured');
        }
        const params = {
            Bucket: integrationConfig.aws.s3Bucket,
            Key: key,
        };
        try {
            await this.s3.deleteObject(params).promise();
            return {
                success: true,
                key,
                bucket: integrationConfig.aws.s3Bucket,
            };
        }
        catch (error) {
            console.error('[AWS S3] Delete error:', error);
            throw new Error('Failed to delete file from S3');
        }
    }
    async getSignedUrl(key, operation = 'getObject', expiresIn = 3600) {
        if (!this.enabled) {
            throw new Error('AWS S3 is not configured');
        }
        const params = {
            Bucket: integrationConfig.aws.s3Bucket,
            Key: key,
        };
        try {
            if (operation === 'getObject') {
                return this.s3.getSignedUrl('getObject', params);
            }
            else {
                return this.s3.getSignedUrl('putObject', params);
            }
        }
        catch (error) {
            console.error('[AWS S3] Signed URL error:', error);
            throw new Error('Failed to generate signed URL');
        }
    }
    async listFiles(prefix, maxKeys = 100) {
        if (!this.enabled) {
            throw new Error('AWS S3 is not configured');
        }
        const params = {
            Bucket: integrationConfig.aws.s3Bucket,
            Prefix: prefix,
            MaxKeys: maxKeys,
        };
        try {
            return await this.s3.listObjectsV2(params).promise();
        }
        catch (error) {
            console.error('[AWS S3] List files error:', error);
            throw new Error('Failed to list files from S3');
        }
    }
    async getFileInfo(key) {
        if (!this.enabled) {
            throw new Error('AWS S3 is not configured');
        }
        const params = {
            Bucket: integrationConfig.aws.s3Bucket,
            Key: key,
        };
        try {
            return await this.s3.headObject(params).promise();
        }
        catch (error) {
            console.error('[AWS S3] Get file info error:', error);
            throw new Error('Failed to get file info from S3');
        }
    }
    isEnabled() {
        return this.enabled;
    }
    getBucketName() {
        return integrationConfig.aws.s3Bucket;
    }
}
export const awsService = AWSService.getInstance();
