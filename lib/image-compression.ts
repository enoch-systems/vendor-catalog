/**
 * Client-side image compression utility
 * Uses browser APIs to compress images before upload
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  preserveAspectRatio?: boolean;
}

export interface CompressedImage {
  blob: Blob;
  dataUrl: string;
  width: number;
  height: number;
  size: number;
  format: string;
}

export class ImageCompressor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    if (typeof window === 'undefined') {
      throw new Error('ImageCompressor can only be used in the browser');
    }
    
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Compress an image file
   */
  async compress(
    file: File,
    options: CompressionOptions = {}
  ): Promise<CompressedImage> {
    const {
      maxWidth = 2048,
      maxHeight = 2048,
      quality = 0.85,
      format = 'webp',
      preserveAspectRatio = true
    } = options;

    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Load image
    const img = await this.loadImage(file);
    
    // Calculate new dimensions
    const { width, height } = this.calculateDimensions(
      img.width,
      img.height,
      maxWidth,
      maxHeight,
      preserveAspectRatio
    );

    // Set canvas dimensions
    this.canvas.width = width;
    this.canvas.height = height;

    // Draw image
    this.ctx.drawImage(img, 0, 0, width, height);

    // Convert to blob
    const mimeType = this.getMimeType(format);
    const blob = await this.canvasToBlob(mimeType, quality);
    
    // Generate data URL
    const dataUrl = this.canvas.toDataURL(mimeType, quality);

    return {
      blob,
      dataUrl,
      width,
      height,
      size: blob.size,
      format
    };
  }

  /**
   * Compress multiple images in parallel
   */
  async compressMultiple(
    files: File[],
    options: CompressionOptions = {}
  ): Promise<CompressedImage[]> {
    const promises = files.map(file => this.compress(file, options));
    return Promise.all(promises);
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(
    file: File,
    size: number = 200
  ): Promise<CompressedImage> {
    return this.compress(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.8,
      format: 'webp'
    });
  }

  /**
   * Get image info without loading
   */
  async getImageInfo(file: File): Promise<{
    width: number;
    height: number;
    size: number;
    type: string;
  }> {
    const img = await this.loadImage(file);
    return {
      width: img.width,
      height: img.height,
      size: file.size,
      type: file.type
    };
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number,
    preserveAspectRatio: boolean
  ): { width: number; height: number } {
    if (!preserveAspectRatio) {
      return { width: maxWidth, height: maxHeight };
    }

    let { width, height } = { width: originalWidth, height: originalHeight };

    // Scale down if necessary
    if (width > maxWidth || height > maxHeight) {
      const aspectRatio = width / height;
      
      if (width > height) {
        width = Math.min(width, maxWidth);
        height = width / aspectRatio;
      } else {
        height = Math.min(height, maxHeight);
        width = height * aspectRatio;
      }
    }

    return { 
      width: Math.round(width), 
      height: Math.round(height) 
    };
  }

  private canvasToBlob(
    mimeType: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        mimeType,
        quality
      );
    });
  }

  private getMimeType(format: string): string {
    switch (format) {
      case 'webp':
        return 'image/webp';
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'image/webp';
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// Singleton instance
export const imageCompressor = new ImageCompressor();

/**
 * Utility function to compress and convert to File
 */
export async function compressToFile(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const compressed = await imageCompressor.compress(file, options);
  const mimeType = compressed.format === 'webp' ? 'image/webp' : 
                   compressed.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  
  return new File([compressed.blob], file.name, {
    type: mimeType,
    lastModified: Date.now()
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!supportedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Supported formats: JPEG, PNG, WebP, GIF' 
    };
  }

  return { valid: true };
}
