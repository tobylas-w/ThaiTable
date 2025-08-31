import AWS from 'aws-sdk';
import { integrationConfig } from '../config/integrations';

export interface UploadResult {
  url: string;
  key: string;
  bucket: string;
  size: number;
  mimeType: string;
}

export interface DeleteResult {
  success: boolean;
  key: string;
  bucket: string;
}

export class AWSService {
  private static instance: AWSService;
  private s3!: AWS.S3;
  private enabled: boolean;

  private constructor() {
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

  public static getInstance(): AWSService {
    if (!AWSService.instance) {
      AWSService.instance = new AWSService();
    }
    return AWSService.instance;
  }

  public async uploadFile(
    file: Buffer,
    fileName: string,
    folder: string = 'uploads',
    contentType?: string
  ): Promise<UploadResult> {
    if (!this.enabled) {
      throw new Error('AWS S3 is not configured');
    }

    const key = `${folder}/${Date.now()}-${fileName}`;
    const params: AWS.S3.PutObjectRequest = {
      Bucket: integrationConfig.aws.s3Bucket!,
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
    } catch (error) {
      console.error('[AWS S3] Upload error:', error);
      throw new Error('Failed to upload file to S3');
    }
  }

  public async uploadMenuImage(
    file: Buffer,
    fileName: string,
    restaurantId: string
  ): Promise<UploadResult> {
    const folder = `menu-images/${restaurantId}`;
    return this.uploadFile(file, fileName, folder, 'image/jpeg');
  }

  public async uploadRestaurantLogo(
    file: Buffer,
    fileName: string,
    restaurantId: string
  ): Promise<UploadResult> {
    const folder = `logos/${restaurantId}`;
    return this.uploadFile(file, fileName, folder, 'image/png');
  }

  public async uploadQRCode(
    file: Buffer,
    fileName: string,
    restaurantId: string
  ): Promise<UploadResult> {
    const folder = `qr-codes/${restaurantId}`;
    return this.uploadFile(file, fileName, folder, 'image/png');
  }

  public async deleteFile(key: string): Promise<DeleteResult> {
    if (!this.enabled) {
      throw new Error('AWS S3 is not configured');
    }

    const params: AWS.S3.DeleteObjectRequest = {
      Bucket: integrationConfig.aws.s3Bucket!,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();

      return {
        success: true,
        key,
        bucket: integrationConfig.aws.s3Bucket!,
      };
    } catch (error) {
      console.error('[AWS S3] Delete error:', error);
      throw new Error('Failed to delete file from S3');
    }
  }

  public async getSignedUrl(
    key: string,
    operation: 'getObject' | 'putObject' = 'getObject',
    expiresIn: number = 3600
  ): Promise<string> {
    if (!this.enabled) {
      throw new Error('AWS S3 is not configured');
    }

    const params: AWS.S3.GetObjectRequest | AWS.S3.PutObjectRequest = {
      Bucket: integrationConfig.aws.s3Bucket!,
      Key: key,
    };

    try {
      if (operation === 'getObject') {
        return this.s3.getSignedUrl('getObject', params as AWS.S3.GetObjectRequest);
      } else {
        return this.s3.getSignedUrl('putObject', params as AWS.S3.PutObjectRequest);
      }
    } catch (error) {
      console.error('[AWS S3] Signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  public async listFiles(
    prefix: string,
    maxKeys: number = 100
  ): Promise<AWS.S3.ListObjectsV2Output> {
    if (!this.enabled) {
      throw new Error('AWS S3 is not configured');
    }

    const params: AWS.S3.ListObjectsV2Request = {
      Bucket: integrationConfig.aws.s3Bucket!,
      Prefix: prefix,
      MaxKeys: maxKeys,
    };

    try {
      return await this.s3.listObjectsV2(params).promise();
    } catch (error) {
      console.error('[AWS S3] List files error:', error);
      throw new Error('Failed to list files from S3');
    }
  }

  public async getFileInfo(key: string): Promise<AWS.S3.HeadObjectOutput> {
    if (!this.enabled) {
      throw new Error('AWS S3 is not configured');
    }

    const params: AWS.S3.HeadObjectRequest = {
      Bucket: integrationConfig.aws.s3Bucket!,
      Key: key,
    };

    try {
      return await this.s3.headObject(params).promise();
    } catch (error) {
      console.error('[AWS S3] Get file info error:', error);
      throw new Error('Failed to get file info from S3');
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getBucketName(): string | undefined {
    return integrationConfig.aws.s3Bucket;
  }
}

export const awsService = AWSService.getInstance();
