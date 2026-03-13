import Image from 'next/image';
import { cn } from '../../lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fill?: boolean;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  ...props
}: OptimizedImageProps) => {
  // Generate blur placeholder if not provided
  const defaultBlurDataURL = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
  
  // Convert to optimized path
  const getOptimizedSrc = (originalSrc: string) => {
    // If it's already in optimized folder, return as is
    if (originalSrc.includes('/optimized/')) return originalSrc;
    
    // Extract filename and extension
    const filename = originalSrc.split('/').pop();
    if (!filename) return originalSrc;
    
    const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
    return `/optimized/${nameWithoutExt}.webp`;
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={getOptimizedSrc(src)}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        priority={priority}
        quality={quality}
        sizes={sizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL || defaultBlurDataURL}
        className="transition-opacity duration-300"
        onError={(e) => {
          // Fallback to original image if optimized version fails
          const target = e.target as HTMLImageElement;
          target.src = src;
        }}
        {...props}
      />
    </div>
  );
};

// Responsive image component for different screen sizes
export const ResponsiveImage = ({
  src,
  alt,
  className,
  aspectRatio = 'auto',
  ...props
}: OptimizedImageProps & { aspectRatio?: 'auto' | 'square' | 'video' | 'portrait' }) => {
  const aspectClasses = {
    auto: '',
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  };

  return (
    <div className={cn('relative w-full', aspectClasses[aspectRatio], className)}>
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        {...props}
      />
    </div>
  );
};
