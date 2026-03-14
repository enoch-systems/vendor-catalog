/**
 * BullMQ setup for background job processing
 */

import { Queue, Worker, Job, ConnectionOptions } from 'bullmq';
import { Redis } from 'ioredis';

// Redis connection options
const redisConnection: any = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true,
};

// Create Redis connection
export const redisConnectionInstance = new Redis(redisConnection);

// Queue names
export const QUEUE_NAMES = {
  IMAGE_PROCESSING: 'image-processing',
  IMAGE_UPLOAD: 'image-upload',
  IMAGE_OPTIMIZATION: 'image-optimization',
} as const;

// Create queues
export const imageProcessingQueue = new Queue(QUEUE_NAMES.IMAGE_PROCESSING, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const imageUploadQueue = new Queue(QUEUE_NAMES.IMAGE_UPLOAD, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

export const imageOptimizationQueue = new Queue(QUEUE_NAMES.IMAGE_OPTIMIZATION, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

// Job types
export interface ImageProcessingJob {
  imageId: string;
  originalUrl: string;
  filename: string;
  mimeType: string;
  size: number;
  userId: string;
  productId?: string;
  options: {
    generateThumbnails?: boolean;
    generateResponsive?: boolean;
    formats?: ('webp' | 'avif' | 'jpeg')[];
    sizes?: number[];
  };
}

export interface ImageUploadJob {
  imageId: string;
  localPath: string;
  cloudinaryFolder?: string;
  transformations?: {
    quality?: number;
    format?: string;
    crop?: string;
  };
}

export interface ImageOptimizationJob {
  imageId: string;
  cloudinaryPublicId: string;
  optimizations: {
    format: 'webp' | 'avif' | 'jpeg';
    quality: number;
    width?: number;
    height?: number;
  }[];
}

// Job status tracking
export interface JobStatus {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  data: any;
  error?: string;
  completedAt?: Date;
  createdAt: Date;
}

// Queue event handlers
export const setupQueueEventHandlers = () => {
  // Image processing queue
  (imageProcessingQueue as any).on('waiting', (job: any) => {
    console.log(`🔄 Job ${job.id} waiting in image processing queue`);
  });

  (imageProcessingQueue as any).on('active', (job: any) => {
    console.log(`⚡ Job ${job.id} active in image processing queue`);
  });

  (imageProcessingQueue as any).on('completed', (job: any) => {
    console.log(`✅ Job ${job.id} completed in image processing queue`);
  });

  (imageProcessingQueue as any).on('failed', (job: any, err: any) => {
    console.error(`❌ Job ${job.id} failed in image processing queue:`, err);
  });

  // Image upload queue
  (imageUploadQueue as any).on('completed', (job: any) => {
    console.log(`✅ Upload job ${job.id} completed`);
  });

  (imageUploadQueue as any).on('failed', (job: any, err: any) => {
    console.error(`❌ Upload job ${job.id} failed:`, err);
  });

  // Image optimization queue
  (imageOptimizationQueue as any).on('completed', (job: any) => {
    console.log(`✅ Optimization job ${job.id} completed`);
  });

  (imageOptimizationQueue as any).on('failed', (job: any, err: any) => {
    console.error(`❌ Optimization job ${job.id} failed:`, err);
  });
};

// Job utility functions
export const addImageProcessingJob = async (
  data: ImageProcessingJob,
  options?: { delay?: number; priority?: number }
) => {
  return await imageProcessingQueue.add('process-image', data, {
    delay: options?.delay,
    priority: options?.priority || 1,
  });
};

export const addImageUploadJob = async (
  data: ImageUploadJob,
  options?: { delay?: number; priority?: number }
) => {
  return await imageUploadQueue.add('upload-image', data, {
    delay: options?.delay,
    priority: options?.priority || 1,
  });
};

export const addImageOptimizationJob = async (
  data: ImageOptimizationJob,
  options?: { delay?: number; priority?: number }
) => {
  return await imageOptimizationQueue.add('optimize-image', data, {
    delay: options?.delay,
    priority: options?.priority || 1,
  });
};

// Get job status
export const getJobStatus = async (queue: Queue, jobId: string): Promise<JobStatus | null> => {
  try {
    const job = await queue.getJob(jobId);
    if (!job) return null;

    const state = await job.getState();
    const progress = job.progress;

    return {
      id: job.id!,
      status: state as JobStatus['status'],
      progress: typeof progress === 'number' ? progress : 0,
      data: job.data,
      error: job.failedReason,
      completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      createdAt: new Date(job.timestamp),
    };
  } catch (error) {
    console.error('Error getting job status:', error);
    return null;
  }
};

// Get queue stats
export const getQueueStats = async (queue: Queue) => {
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaiting(),
    queue.getActive(),
    queue.getCompleted(),
    queue.getFailed(),
  ]);

  return {
    waiting: waiting.length,
    active: active.length,
    completed: completed.length,
    failed: failed.length,
  };
};

// Clean up queues
export const cleanUpQueues = async () => {
  await Promise.all([
    imageProcessingQueue.close(),
    imageUploadQueue.close(),
    imageOptimizationQueue.close(),
    redisConnectionInstance.quit(),
  ]);
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Shutting down queues...');
  await cleanUpQueues();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down queues...');
  await cleanUpQueues();
  process.exit(0);
});
