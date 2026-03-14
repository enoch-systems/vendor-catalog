/**
 * API route for image processing in Vercel serverless environment
 * POST /api/process-image
 */

import { NextRequest, NextResponse } from 'next/server';
import { createImageProcessor } from '@/lib/image-processor';

// Configure storage provider based on environment
const getStorageProvider = () => {
  const provider = process.env.IMAGE_STORAGE_PROVIDER || 'vercel-blob';
  
  const configs: Record<string, any> = {
    'cloudinary': {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    's3': {
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      bucketName: process.env.AWS_S3_BUCKET_NAME,
    },
    'vercel-blob': {
      // Vercel Blob configuration is automatic
    },
  };

  return { provider, config: configs[provider] };
};

const { provider, config } = getStorageProvider();
const imageProcessor = createImageProcessor(provider as any, config);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const options = JSON.parse(formData.get('options') as string || '{}');
    
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, AVIF' 
      }, { status: 400 });
    }

    // Check file size (10MB limit for Vercel)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 10MB' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Process image
    const result = await imageProcessor.processImageBuffer(buffer, file.name, {
      formats: options.formats || ['webp', 'avif'],
      sizes: options.sizes || [300, 600, 1200],
      quality: options.quality || 85,
      stripMetadata: options.stripMetadata !== false,
      normalizeOrientation: options.normalizeOrientation !== false,
    });

    // Upload processed images to storage
    const uploadPromises = result.processed.map(async (processed) => {
      const contentType = `image/${processed.format}`;
      return await imageProcessor.uploadToStorage(
        processed.buffer,
        processed.key!,
        contentType
      );
    });

    const uploadResults = await Promise.all(uploadPromises);

    return NextResponse.json({
      success: true,
      original: result.original,
      processed: result.processed.map((processed, index) => ({
        format: processed.format,
        size: processed.size,
        width: processed.width,
        height: processed.height,
        url: uploadResults[index].url,
        key: uploadResults[index].key,
      })),
    });
  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    );
  }
}

// GET endpoint for image information
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Fetch image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    // Get image info
    const info = await imageProcessor.getImageInfoFromBuffer(buffer);

    // Extract colors
    const colors = await imageProcessor.extractColorsFromBuffer(buffer);

    return NextResponse.json({
      success: true,
      info,
      colors,
    });
  } catch (error) {
    console.error('Image info error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get image info' },
      { status: 500 }
    );
  }
}
