// compress image before upload for faster performance
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        // Resize if image is too large (max 1920px width)
        if (width > 1920) {
          height = (height * 1920) / width;
          width = 1920;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
    };
  });
}

export async function uploadToCloudinary(
  file: File
): Promise<{ url: string; public_id: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME env variable');
  }

  // compress before upload
  const compressedFile = await compressImage(file);

  const form = new FormData();
  form.append('file', compressedFile);
  // unsigned preset defined in Cloudinary dashboard
  form.append('upload_preset', 'product_images');

  const resp = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    {
      method: 'POST',
      body: form,
    }
  );

  if (!resp.ok) {
    const err = await resp.json().catch(() => null);
    throw new Error(
      'Cloudinary upload failed: ' + (err?.error?.message || resp.statusText)
    );
  }

  const data = await resp.json();
  return { url: data.secure_url, public_id: data.public_id };
}

