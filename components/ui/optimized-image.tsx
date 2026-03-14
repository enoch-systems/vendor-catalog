'use client'

import React, { useMemo, useState } from 'react';
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
  placeholder?: string;
  blurDataURL?: string;
  fill?: boolean;
}

const DEFAULT_SIZES = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
const DEFAULT_WIDTHS = [320, 480, 768, 1024, 1280, 1536, 2048];

const DEFAULT_BLUR = undefined;

const normalizeSrc = (src: string) => {
  if (!src) return '';
  // Some URLs can include invisible chars (BOM, newline) or whitespace.
  const cleaned = src.replace(/^\uFEFF/, '').trim();
  // Handle protocol-relative URLs like //res.cloudinary.com/...
  if (cleaned.startsWith('//')) return `https:${cleaned}`;
  return cleaned;
};

const isRemoteUrl = (src: string) => /^https?:\/\//i.test(src);

const getOptimizedBase = (originalSrc: string) => {
  const src = normalizeSrc(originalSrc);

  if (isRemoteUrl(src)) return src;

  // If the caller already provided an optimized path, keep it, but avoid
  // producing broken paths like `/optimized/-320.avif` when the src is
  // missing a filename.
  if (src.includes('/optimized/')) {
    const cleaned = src.replace(/\.(webp|avif)$/i, '');
    if (cleaned.endsWith('/optimized') || cleaned.endsWith('/optimized/')) {
      // If we end up with a base like "/optimized/", fall back to a safe placeholder
      return '/wig.png';
    }
    return cleaned;
  }

  const filename = src.split('/').pop();
  if (!filename) {
    // No filename present, avoid generating /optimized/-320.avif
    return '/placeholder.png';
  }

  const nameWithoutExt = filename.split('.').slice(0, -1).join('.');
  if (!nameWithoutExt) {
    return '/placeholder.png';
  }
  return `/optimized/${nameWithoutExt}`;
};

const buildSrcSet = (base: string, format: string, widths: number[]) =>
  widths.map((w) => `${base}-${w}.${format} ${w}w`).join(', ');

export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  sizes = DEFAULT_SIZES,
  placeholder,
  blurDataURL,
  fill = false,
  ...props
}: OptimizedImageProps) => {
  const normalizedSrc = useMemo(() => normalizeSrc(src), [src]);
  const isRemote = isRemoteUrl(normalizedSrc);
  const [loaded, setLoaded] = useState(isRemote);

  const base = useMemo(() => {
    const b = getOptimizedBase(normalizedSrc);
    if (!normalizedSrc || b === '' || b === '/optimized' || b.endsWith('/optimized/')) {
      // Log unexpected optimized base values which can create broken /optimized/-320.avif requests.
      console.warn('[OptimizedImage] unexpected optimized base', { src: normalizedSrc, base: b });
    }
    return b;
  }, [normalizedSrc]);
  const webpSrc = `${base}.webp`;
  const avifSrc = `${base}.avif`;
  const srcSetWebp = useMemo(() => buildSrcSet(base, 'webp', DEFAULT_WIDTHS), [base]);
  const srcSetAvif = useMemo(() => buildSrcSet(base, 'avif', DEFAULT_WIDTHS), [base]);

  const wrapperStyle = useMemo(() => {
    const placeholderUrl = blurDataURL || placeholder;

    if (placeholderUrl) {
      return {
        backgroundImage: `url(${placeholderUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    // Fallback shimmer background (to avoid a black/blank area)
    return {
      background: 'linear-gradient(to right, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
    };
  }, [blurDataURL, placeholder]);

  if (isRemote) {
    // Use Next/Image for remote sources to leverage built-in optimization
    const shouldFill = fill || !width || !height;

    return (
      <div className={cn('relative overflow-hidden', className)} style={wrapperStyle}>
        <Image
          src={normalizedSrc}
          alt={alt}
          {...(blurDataURL || placeholder
            ? {
                placeholder: 'blur' as const,
                blurDataURL: blurDataURL || placeholder,
              }
            : {})}
          {...(shouldFill ? { fill: true } : { width, height })}
          priority={priority}
          sizes={sizes}
          className={cn('transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
          onLoadingComplete={() => setLoaded(true)}
          {...(shouldFill ? { style: { width: '100%', height: '100%', objectFit: 'cover' } } : {})}
          {...props}
        />
      </div>
    );
  }

  const baseIsInvalid = base === '' || base === '/optimized' || base === '/optimized/';
  if (baseIsInvalid) {
    // Avoid generating broken optimized URLs like /optimized/-320.avif
    const fallbackSrc = normalizedSrc || '/wig.png';
    return (
      <div className={cn('relative overflow-hidden', className)} style={wrapperStyle}>
        <img
          src={fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn('transition-opacity duration-300', loaded ? 'opacity-100' : 'opacity-0')}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          {...(fill ? { style: { width: '100%', height: '100%', objectFit: 'cover' } } : {})}
          {...props}
        />
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={wrapperStyle}
    >
      <picture>
        <source type="image/avif" srcSet={srcSetAvif} sizes={sizes} />
        <source type="image/webp" srcSet={srcSetWebp} sizes={sizes} />
        <img
          src={webpSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.includes('/optimized/')) return;
            target.src = normalizedSrc;
          }}
          {...(fill ? { style: { width: '100%', height: '100%', objectFit: 'cover' } } : {})}
          {...props}
        />
      </picture>
    </div>
  );
};

// Responsive image wrapper
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
    portrait: 'aspect-[3/4]',
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
