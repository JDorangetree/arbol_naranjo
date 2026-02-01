/**
 * Servicio de Firebase Storage para El Tesoro de Tomás
 *
 * Gestiona la carga de fotos para los capítulos de "Mi Historia"
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './config';

// Tipos de archivos permitidos (incluyendo HEIC/HEIF de iPhone)
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];
// Algunos navegadores reportan HEIC sin el tipo MIME correcto
const HEIC_EXTENSIONS = ['.heic', '.heif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

export interface UploadError {
  code: string;
  message: string;
}

/**
 * Verifica si un archivo es HEIC por su extensión
 * (algunos navegadores no detectan correctamente el tipo MIME de HEIC)
 */
function isHeicByExtension(fileName: string): boolean {
  const lowerName = fileName.toLowerCase();
  return HEIC_EXTENSIONS.some(ext => lowerName.endsWith(ext));
}

/**
 * Valida un archivo antes de subirlo
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Verificar por tipo MIME o por extensión (para HEIC que a veces no tiene MIME correcto)
  const isValidType = ALLOWED_IMAGE_TYPES.includes(file.type) || isHeicByExtension(file.name);

  if (!isValidType) {
    return {
      valid: false,
      error: 'Solo se permiten imágenes (JPG, PNG, WEBP, GIF, HEIC)',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'La imagen es muy grande. El máximo es 10MB.',
    };
  }

  return { valid: true };
}

/**
 * Genera un nombre único para el archivo
 */
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${timestamp}_${randomStr}.${extension}`;
}

/**
 * Sube una imagen a Firebase Storage para un capítulo
 */
export async function uploadChapterImage(
  userId: string,
  chapterId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  // Validar archivo
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generar ruta única
  const fileName = generateFileName(file.name);
  const storagePath = `users/${userId}/chapters/${chapterId}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  return new Promise((resolve, reject) => {
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot: UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.({
          progress,
          bytesTransferred: snapshot.bytesTransferred,
          totalBytes: snapshot.totalBytes,
        });
      },
      (error) => {
        // Mensajes de error amigables
        const friendlyMessages: Record<string, string> = {
          'storage/unauthorized': 'No tienes permiso para subir archivos. Verifica tu sesión.',
          'storage/canceled': 'La subida fue cancelada.',
          'storage/unknown': 'Ocurrió un error inesperado. Intenta de nuevo.',
          'storage/quota-exceeded': 'Se ha alcanzado el límite de almacenamiento.',
          'storage/retry-limit-exceeded': 'La conexión falló varias veces. Verifica tu internet.',
        };

        const message = friendlyMessages[error.code] || 'No pudimos subir la imagen. Intenta de nuevo.';
        reject(new Error(message));
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            url: downloadURL,
            path: storagePath,
            fileName,
          });
        } catch {
          reject(new Error('No pudimos obtener la URL de la imagen. Intenta de nuevo.'));
        }
      }
    );
  });
}

/**
 * Sube múltiples imágenes a Firebase Storage
 */
export async function uploadMultipleImages(
  userId: string,
  chapterId: string,
  files: File[],
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await uploadChapterImage(
      userId,
      chapterId,
      files[i],
      (progress) => onProgress?.(i, progress)
    );
    results.push(result);
  }

  return results;
}

/**
 * Elimina una imagen de Firebase Storage
 */
export async function deleteChapterImage(imageUrl: string): Promise<void> {
  try {
    // Extraer la ruta del Storage desde la URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error: unknown) {
    // Si el archivo no existe, no es un error crítico
    if ((error as { code?: string })?.code === 'storage/object-not-found') {
      return;
    }
    throw new Error('No pudimos eliminar la imagen. Intenta de nuevo.');
  }
}

/**
 * Elimina múltiples imágenes de Firebase Storage
 */
export async function deleteMultipleImages(imageUrls: string[]): Promise<void> {
  const deletePromises = imageUrls.map((url) => deleteChapterImage(url));
  await Promise.allSettled(deletePromises);
}

/**
 * Comprime una imagen antes de subirla (opcional, para optimización)
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      let { width, height } = img;

      // Solo redimensionar si es más grande que el máximo
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Si falla, devolver original
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      resolve(file); // Si falla, devolver original
    };

    img.src = URL.createObjectURL(file);
  });
}
