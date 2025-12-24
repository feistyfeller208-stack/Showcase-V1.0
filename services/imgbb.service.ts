
const IMGBB_API_KEY = 'dde6d52408d0ece70ff0015c6fa2c2f8'; 

export const uploadImageToImgBB = async (file: File | Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error: any) {
    console.error('ImgBB upload error:', error);
    throw new Error('Image server connection failed.');
  }
};

export const compressImage = (file: File, maxWidth = 800): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name || 'image.jpg', { type: 'image/jpeg' }));
          } else reject(new Error('Compression failed'));
        }, 'image/jpeg', 0.8);
      };
      img.onerror = () => reject(new Error('Load error'));
    };
    reader.onerror = () => reject(new Error('Read error'));
  });
};
