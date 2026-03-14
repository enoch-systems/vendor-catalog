/**
 * Server-side image processing service using Sharp
 */

import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
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
    path: string;
    url: string;
  }[];
  metadata: sharp.Metadata;
}

export interface ImageSize {
  width: number;
  height: number;
  suffix: string;
}

export class ImageProcessor {
  private readonly uploadDir: string;
  private readonly processedDir: string;
  private readonly defaultSizes: ImageSize[] = [
    { width: 48, height: 48, suffix: 'thumb' },
    { width: 96, height: 96, suffix: 'small' },
    { width: 256, height: 256, suffix: 'medium' },
    { width: 512, height: 512, suffix: 'large' },
    { width: 1024, height: 1024, suffix: 'xlarge' },
  ];

  constructor(uploadDir = './uploads', processedDir = './processed') {
    this.uploadDir = uploadDir;
    this.processedDir = processedDir;
  }

  /**
   * Initialize directories
   */
  async initialize(): Promise<void> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    await fs.mkdir(this.processedDir, { recursive: true });
  }

  /**
   * Process an image file
   */
  async processImage(
    inputPath: string,
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
    const metadata = await sharp(inputPath).metadata();
    
    // Create base processor
    let processor = sharp(inputPath);
    
    // Strip metadata if requested
    if (stripMetadata) {
      processor = processor.withMetadata({ orientation: normalizeOrientation ? undefined : undefined });
    }

    // Normalize orientation if requested
    if (normalizeOrientation) {
      processor = processor.rotate(); // Auto-rotate based on EXIF
    }

    const processed: ProcessedImageResult['processed'] = [];

    // Generate different formats and sizes
    for (const format of formats) {
      for (const size of sizes) {
        const result = await this.processVariant(processor, format, size, quality, resizeOptions, metadata);
        processed.push(result);
      }
    }

    return {
      original: {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        size: (await fs.stat(inputPath)).size
      },
      processed,
      metadata
    };
  }

  /**
   * Process a single image variant
   */
  private async processVariant(
    baseProcessor: sharp.Sharp,
    format: string,
    size: number,
    quality: number,
    resizeOptions: sharp.ResizeOptions,
    originalMetadata: sharp.Metadata
  ): Promise<ProcessedImageResult['processed'][0]> {
    const filename = `${uuidv4()}_${size}.${format}`;
    const outputPath = path.join(this.processedDir, filename);

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
          quality,
          progressive: true,
          compressionLevel: 9
        });
        break;
    }

    // Process and save
    await processor.toFile(outputPath);

    // Get processed metadata
    const processedMetadata = await sharp(outputPath).metadata();
    const stats = await fs.stat(outputPath);

    return {
      format,
      size: stats.size,
      width: processedMetadata.width || 0,
      height: processedMetadata.height || 0,
      path: outputPath,
      url: `/processed/${filename}`
    };
  }

  /**
   * Generate thumbnails with specific dimensions
   */
  async generateThumbnails(
    inputPath: string,
    sizes: { width: number; height: number }[] = [
      { width: 150, height: 150 },
      { width: 300, height: 300 },
      { width: 600, height: 600 }
    ]
  ): Promise<ProcessedImageResult['processed']> {
    const results: ProcessedImageResult['processed'] = [];

    for (const size of sizes) {
      const filename = `thumb_${size.width}x${size.height}_${uuidv4()}.webp`;
      const outputPath = path.join(this.processedDir, filename);

      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center',
          withoutEnlargement: true
        })
        .webp({
          quality: 80,
          effort: 6
        })
        .toFile(outputPath);

      const metadata = await sharp(outputPath).metadata();
      const stats = await fs.stat(outputPath);

      results.push({
        format: 'webp',
        size: stats.size,
        width: metadata.width || 0,
        height: metadata.height || 0,
        path: outputPath,
        url: `/processed/${filename}`
      });
    }

    return results;
  }

  /**
   * Optimize image for web (single format, multiple sizes)
   */
  async optimizeForWeb(
    inputPath: string,
    maxWidth = 2048,
    quality = 85
  ): Promise<ProcessedImageResult['processed']> {
    const metadata = await sharp(inputPath).metadata();
    const results: ProcessedImageResult['processed'] = [];

    // Responsive sizes for web
    const sizes = [320, 640, 768, 1024, 1280, 1536, 2048]
      .filter(size => size <= (metadata.width || 2048));

    for (const size of sizes) {
      const filename = `web_${size}w_${uuidv4()}.webp`;
      const outputPath = path.join(this.processedDir, filename);

      await sharp(inputPath)
        .resize(size, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({
          quality,
          effort: 6
        })
        .toFile(outputPath);

      const processedMetadata = await sharp(outputPath).metadata();
      const stats = await fs.stat(outputPath);

      results.push({
        format: 'webp',
        size: stats.size,
        width: processedMetadata.width || 0,
        height: processedMetadata.height || 0,
        path: outputPath,
        url: `/processed/${filename}`
      });
    }

    return results;
  }

  /**
   * Extract dominant colors from image
   */
  async extractColors(inputPath: string, count = 5): Promise<{
    dominant: string;
    palette: string[];
  }> {
    const { dominant } = await sharp(inputPath)
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

    return dominant;
  }

  /**
   * Clean up processed files
   */
  async cleanup(maxAge = 24 * 60 * 60 * 1000): Promise<void> {
    try {
      const files = await fs.readdir(this.processedDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.processedDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`🗑️ Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Get image info without processing
   */
  async getImageInfo(inputPath: string): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
    hasAlpha: boolean;
    colorSpace: string;
  }> {
    const metadata = await sharp(inputPath).metadata();
    const stats = await fs.stat(inputPath);

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: stats.size,
      hasAlpha: metadata.hasAlpha || false,
      colorSpace: metadata.space || 'srgb'
    };
  }
}

// Export singleton instance
export const imageProcessor = new ImageProcessor();
