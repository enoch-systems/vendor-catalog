/**
 * Vercel-ready image processing service using Sharp
 * Optimized for serverless deployment with cloud storage integration
 */

import sharp from 'sharp';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ImageProcessingOptions {
  formats?: ('webp' | 'avif' | 'jpeg' | 'png')[];
  sizes?: number[];
  quality?: number;
  stripMetadata?: boolean;
  normalizeOrientation?: boolean;
  resizeOptions?: sharp.ResizeOptions;
}

export interface ProcessedImageResult {
  original: {
    width: number;
    height: number;
    format: string;
    size: number;
  };
  processed: {
    format: string;
    size: number;
    width: number;
    height: number;
    buffer: Buffer;
    url?: string;
    key?: string;
  }[];
  metadata: sharp.Metadata;
}

export interface ImageSize {
  width: number;
  height: number;
  suffix: string;
}

export class ImageProcessor {
  private readonly defaultSizes: ImageSize[] = [
    { width: 48, height: 48, suffix: 'thumb' },
    { width: 96, height: 96, suffix: 'small' },
    { width: 256, height: 256, suffix: 'medium' },
    { width: 512, height: 512, suffix: 'large' },
    { width: 1024, height: 1024, suffix: 'xlarge' },
  ];

  constructor(
    private storageProvider?: 'cloudinary' | 's3' | 'vercel-blob',
    private storageConfig?: Record<string, any>
  ) {}

  /**
   * Process an image buffer (Vercel serverless compatible)
   */
  async processImageBuffer(
    inputBuffer: Buffer,
    originalFilename: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImageResult> {
    const {
      formats = ['webp', 'avif', 'jpeg'],
      sizes = this.defaultSizes.map(s => s.width),
      quality = 85,
      stripMetadata = true,
      normalizeOrientation = true,
      resizeOptions = {}
    } = options;

    // Get image metadata
    const metadata = await sharp(inputBuffer).metadata();
    const originalSize = inputBuffer.length;
    
    // Create base processor
    let processor = sharp(inputBuffer);
    
    // Strip metadata if requested
    if (stripMetadata) {
      processor = processor.withMetadata({});
    }

    // Normalize orientation if requested
    if (normalizeOrientation) {
      processor = processor.rotate(); // Auto-rotate based on EXIF
    }

    const processed: ProcessedImageResult['processed'] = [];

    // Generate different formats and sizes
    for (const format of formats) {
      for (const size of sizes) {
        const result = await this.processVariantToBuffer(processor, format, size, quality, resizeOptions, metadata);
        processed.push(result);
      }
    }

    return {
      original: {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: originalSize
      },
      processed,
      metadata
    };
  }

  /**
   * Process an image file (legacy compatibility)
   */
  async processImage(
    inputPath: string,
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImageResult> {
    // For Vercel deployment, prefer buffer-based processing
    throw new Error('Use processImageBuffer for Vercel serverless deployment. File system access is limited.');
  }

  /**
   * Process a single image variant to buffer (Vercel compatible)
   */
  private async processVariantToBuffer(
    baseProcessor: sharp.Sharp,
    format: string,
    size: number,
    quality: number,
    resizeOptions: sharp.ResizeOptions,
    originalMetadata: sharp.Metadata
  ): Promise<ProcessedImageResult['processed'][0]> {
    const filename = `${uuidv4()}_${size}.${format}`;

    // Create processor for this variant
    let processor = baseProcessor.clone();

    // Only resize if the original is larger than the target size
    if (originalMetadata.width && originalMetadata.width > size) {
      processor = processor.resize(size, null, {
        withoutEnlargement: true,
        fit: 'inside',
        ...resizeOptions
      });
    }

    // Apply format-specific options
    switch (format) {
      case 'webp':
        processor = processor.webp({
          quality,
          effort: 6,
          smartSubsample: true,
          nearLossless: quality > 90
        });
        break;
      case 'avif':
        processor = processor.avif({
          quality,
          effort: 6,
          chromaSubsampling: '4:2:0'
        });
        break;
      case 'jpeg':
        processor = processor.jpeg({
          quality,
          progressive: true,
          mozjpeg: true
        });
        break;
      case 'png':
        processor = processor.png({
          progressive: true,
          compressionLevel: 9
        });
        break;
    }

    // Process to buffer
    const buffer = await processor.toBuffer();
    const metadata = await sharp(buffer).metadata();

    return {
      format,
      size: buffer.length,
      width: metadata.width || 0,
      height: metadata.height || 0,
      buffer,
      url: undefined,
      key: filename
    };
  }

  /**
   * Process a single image variant (legacy file-based)
   */
  private async processVariant(
    baseProcessor: sharp.Sharp,
    format: string,
    size: number,
    quality: number,
    resizeOptions: sharp.ResizeOptions,
    originalMetadata: sharp.Metadata
  ): Promise<ProcessedImageResult['processed'][0]> {
    // For Vercel deployment, use buffer-based processing
    throw new Error('Use processVariantToBuffer for Vercel serverless deployment.');
  }

  /**
   * Generate thumbnails from buffer (Vercel compatible)
   */
  async generateThumbnailsFromBuffer(
    inputBuffer: Buffer,
    sizes: { width: number; height: number }[] = [
      { width: 150, height: 150 },
      { width: 300, height: 300 },
      { width: 600, height: 600 }
    ]
  ): Promise<ProcessedImageResult['processed']> {
    const results: ProcessedImageResult['processed'] = [];

    for (const size of sizes) {
      const filename = `thumb_${size.width}x${size.height}_${uuidv4()}.webp`;

      const buffer = await sharp(inputBuffer)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true
        })
        .webp({
          quality: 80,
          effort: 6
        })
        .toBuffer();

      const metadata = await sharp(buffer).metadata();

      results.push({
        format: 'webp',
        size: buffer.length,
        width: metadata.width || 0,
        height: metadata.height || 0,
        buffer,
        url: undefined,
        key: filename
      });
    }

    return results;
  }

  /**
   * Generate thumbnails with specific dimensions (legacy)
   */
  async generateThumbnails(
    inputPath: string,
    sizes: { width: number; height: number }[] = [
      { width: 150, height: 150 },
      { width: 300, height: 300 },
      { width: 600, height: 600 }
    ]
  ): Promise<ProcessedImageResult['processed']> {
    throw new Error('Use generateThumbnailsFromBuffer for Vercel serverless deployment.');
  }

  /**
   * Optimize image for web from buffer (Vercel compatible)
   */
  async optimizeForWebFromBuffer(
    inputBuffer: Buffer,
    maxWidth = 2048,
    quality = 85
  ): Promise<ProcessedImageResult['processed']> {
    const metadata = await sharp(inputBuffer).metadata();
    const results: ProcessedImageResult['processed'] = [];

    // Responsive sizes for web
    const sizes = [320, 640, 768, 1024, 1280, 1536, 2048]
      .filter(size => size <= (metadata.width || 2048));

    for (const size of sizes) {
      const filename = `web_${size}w_${uuidv4()}.webp`;

      const buffer = await sharp(inputBuffer)
        .resize(size, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({
          quality,
          effort: 6
        })
        .toBuffer();

      const processedMetadata = await sharp(buffer).metadata();

      results.push({
        format: 'webp',
        size: buffer.length,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        buffer,
        url: undefined,
        key: filename
      });
    }

    return results;
  }

  /**
   * Optimize image for web (single format, multiple sizes) - legacy
   */
  async optimizeForWeb(
    inputPath: string,
    maxWidth = 2048,
    quality = 85
  ): Promise<ProcessedImageResult['processed']> {
    throw new Error('Use optimizeForWebFromBuffer for Vercel serverless deployment.');
  }

  /**
   * Extract dominant colors from buffer (Vercel compatible)
   */
  async extractColorsFromBuffer(inputBuffer: Buffer, count = 5): Promise<{
    dominant: string;
    palette: string[];
  }> {
    const result = await sharp(inputBuffer)
      .resize(150, 150, { fit: 'inside' })
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Simple color extraction - in production, use a more sophisticated algorithm
        const colors: { [key: string]: number } = {};
        
        for (let i = 0; i < data.length; i += info.channels) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          colors[hex] = (colors[hex] || 0) + 1;
        }

        const sorted = Object.entries(colors)
          .sort(([, a], [, b]) => b - a)
          .slice(0, count)
          .map(([color]) => color);

        return {
          dominant: sorted[0] || '#000000',
          palette: sorted
        };
      });

    return result;
  }

  /**
   * Extract dominant colors from image (legacy)
   */
  async extractColors(inputPath: string, count = 5): Promise<{
    dominant: string;
    palette: string[];
  }> {
    throw new Error('Use extractColorsFromBuffer for Vercel serverless deployment.');
  }

  /**
   * Clean up processed files (not applicable for Vercel serverless)
   */
  async cleanup(maxAge = 24 * 60 * 60 * 1000): Promise<void> {
    // In Vercel serverless, files are not persisted
    // Use cloud storage lifecycle policies instead
    console.log('Cleanup not needed for Vercel serverless deployment');
  }

  /**
   * Get image info from buffer (Vercel compatible)
   */
  async getImageInfoFromBuffer(inputBuffer: Buffer): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
    hasAlpha: boolean;
    colorSpace: string;
  }> {
    const metadata = await sharp(inputBuffer).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: inputBuffer.length,
      hasAlpha: metadata.hasAlpha || false,
      colorSpace: metadata.space || 'srgb'
    };
  }

  /**
   * Get image info without processing (legacy)
   */
  async getImageInfo(inputPath: string): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
    hasAlpha: boolean;
    colorSpace: string;
  }> {
    throw new Error('Use getImageInfoFromBuffer for Vercel serverless deployment.');
  }

  /**
   * Upload processed image to cloud storage
   */
  async uploadToStorage(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    if (!this.storageProvider || !this.storageConfig) {
      throw new Error('Storage provider not configured');
    }

    switch (this.storageProvider) {
      case 'cloudinary':
        return this.uploadToCloudinary(buffer, key, contentType);
      case 'vercel-blob':
        return this.uploadToVercelBlob(buffer, key, contentType);
      case 's3':
        return this.uploadToS3(buffer, key, contentType);
      default:
        throw new Error(`Unsupported storage provider: ${this.storageProvider}`);
    }
  }

  private async uploadToCloudinary(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    // Implementation depends on your Cloudinary setup
    const cloudinary = require('cloudinary').v2;
    
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: key,
          format: key.split('.').pop(),
        },
        (error: any, result: any) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, key });
        }
      ).end(buffer);
    });
  }

  private async uploadToVercelBlob(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    // Implementation for Vercel Blob storage
    const { put } = require('@vercel/blob');
    
    const blob = await put(key, buffer, {
      contentType,
      access: 'public',
    });
    
    return { url: blob.url, key: blob.pathname };
  }

  private async uploadToS3(
    buffer: Buffer,
    key: string,
    contentType: string
  ): Promise<{ url: string; key: string }> {
    // Implementation for AWS S3
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    
    if (!this.storageConfig) {
      throw new Error('S3 configuration not provided');
    }
    
    const s3Client = new S3Client(this.storageConfig);
    
    await s3Client.send(new PutObjectCommand({
      Bucket: this.storageConfig.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
    
    const url = `https://${this.storageConfig.bucketName}.s3.amazonaws.com/${key}`;
    return { url, key };
  }
}

// Export factory function for Vercel deployment
export function createImageProcessor(
  storageProvider?: 'cloudinary' | 's3' | 'vercel-blob',
  storageConfig?: Record<string, any>
): ImageProcessor {
  return new ImageProcessor(storageProvider, storageConfig);
}

// Export singleton instance (legacy compatibility)
export const imageProcessor = new ImageProcessor();
