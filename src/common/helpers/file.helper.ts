// src/common/utils/file.helper.ts
import { join, relative } from 'path';
import { promises as fs } from 'fs';
import { v4 as uuid } from 'uuid';
import * as sharp from 'sharp';

// Definimos los formatos soportados
export type SupportedFormat = 'webp' | 'jpeg' | 'jpg' | 'png';

export class FileHelper {
  static readonly uploadsPath = join(process.cwd(), 'uploads');

  // Lista blanca de extensiones permitidas
  static readonly allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

  // Extensiones y MIME types soportados
  private static formatMap: Record<SupportedFormat, string> = {
    webp: 'image/webp',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
  };

  /**
   * Optimiza la imagen en memoria
   */
  static async optimizeImage(
    fileBuffer: Buffer,
    format: SupportedFormat = 'webp',
  ): Promise<Buffer> {
    return await sharp(fileBuffer)
      .toFormat(format as unknown as sharp.AvailableFormatInfo, {
        quality: 80,
        mozjpeg: true,
      })
      .toBuffer();
  }

  /**
   * Guarda un archivo optimizado en un nuevo formato
   */
  static async saveImgFile(
    file: Express.Multer.File,
    folder: string,
    targetFormat: SupportedFormat = 'webp',
    options?: { width?: number; aspectRatio?: number },
  ): Promise<{ url: string; ext: string; mimetype: string }> {
    try {
      const folderPath = join(this.uploadsPath, folder);
      await fs.mkdir(folderPath, { recursive: true });

      // --- Validar tipo MIME (más seguro que usar extensión) ---
      if (!Object.values(this.formatMap).includes(file.mimetype)) {
        throw new Error(`MIME no permitido: ${file.mimetype}`);
      }

      // --- Obtener buffer según storage ---
      let inputBuffer: Buffer;
      if (file.buffer) {
        inputBuffer = file.buffer; // memoryStorage
      } else if (file.path) {
        inputBuffer = await fs.readFile(file.path); // diskStorage
      } else {
        throw new Error('No se pudo obtener el archivo');
      }

      let pipeline = sharp(inputBuffer);

      // --- Recorte según aspect ratio ---
      if (options?.aspectRatio) {
        const metadata = await pipeline.metadata();
        if (!metadata.width || !metadata.height) {
          throw new Error('No se pudo obtener dimensiones de la imagen');
        }

        const { width, height } = metadata;
        const currentRatio = width / height;
        const targetRatio = options.aspectRatio;

        if (Math.abs(currentRatio - targetRatio) > 0.01) {
          let cropWidth = width;
          let cropHeight = height;

          if (currentRatio > targetRatio) {
            cropWidth = Math.floor(height * targetRatio);
            cropHeight = height;
          } else {
            cropWidth = width;
            cropHeight = Math.floor(width / targetRatio);
          }

          const left = Math.floor((width - cropWidth) / 2);
          const top = Math.floor((height - cropHeight) / 2);

          pipeline = pipeline.extract({
            left,
            top,
            width: cropWidth,
            height: cropHeight,
          });
        }
      }

      // --- Redimensionar ---
      if (options?.width) {
        pipeline = pipeline.resize({ width: options.width });
      }

      // --- Aplicar formato y optimización ---
      if (targetFormat === 'webp') {
        pipeline = pipeline.webp({ quality: 80 });
      } else if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      } else if (targetFormat === 'png') {
        pipeline = pipeline.png({ quality: 80 });
      }

      const optimizedBuffer = await pipeline.toBuffer();

      const filename = `${uuid()}.${targetFormat}`;
      const filePath = join(folderPath, filename);

      await fs.writeFile(filePath, optimizedBuffer);

      // Construir URL relativa (ej: /uploads/folder/file.webp)
      const publicUrl =
        '/uploads/' + relative(this.uploadsPath, filePath).replace(/\\/g, '/');

      return {
        url: publicUrl,
        ext: targetFormat,
        mimetype: this.formatMap[targetFormat],
      };
    } catch (error) {
      console.error('Error al guardar archivo optimizado:', error);
      throw new Error('No se pudo guardar el archivo optimizado');
    }
  }

  /**
   * Crea un thumbnail optimizado en un nuevo formato
   */
  static async createThumbnail(
    inputPath: string,
    folder: string,
    width: number = 200,
    square: boolean = false,
    targetFormat: SupportedFormat = 'webp',
  ): Promise<{ url: string; ext: string; mimetype: string }> {
    try {
      const folderPath = join(this.uploadsPath, folder);
      const thumbDir = join(folderPath, 'thumbnails');
      await fs.mkdir(thumbDir, { recursive: true });

      const filename = `${uuid()}_thumb.${targetFormat}`;
      const thumbPath = join(thumbDir, filename);

      let pipeline = sharp(inputPath).resize(
        square ? { width, height: width, fit: 'cover' } : { width },
      );

      // --- Aplicar formato según destino ---
      if (targetFormat === 'webp') {
        pipeline = pipeline.webp({ quality: 80 });
      } else if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
        pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
      } else if (targetFormat === 'png') {
        pipeline = pipeline.png({ quality: 80 });
      }

      await pipeline.toFile(thumbPath);

      // Construir URL pública relativa
      const publicUrl =
        '/uploads/' + relative(this.uploadsPath, thumbPath).replace(/\\/g, '/');

      return {
        url: publicUrl,
        ext: targetFormat,
        mimetype: this.formatMap[targetFormat],
      };
    } catch (error) {
      console.error('Error al crear thumbnail optimizado:', error);
      throw new Error('No se pudo generar el thumbnail optimizado');
    }
  }

  /**
   * Guarda un archivo adjunto
   */
  static async saveAttachment(
    attachment: {
      filename: string;
      mimeType: string;
      size: number;
      content: string;
    },
    saveDir = 'mail-attachment', // Carpeta destino por defecto
  ): Promise<{ publicUrl: string }> {
    const folderPath = join(this.uploadsPath, saveDir);
    await fs.mkdir(folderPath, { recursive: true });

    // Convertir Base64 a Buffer binario
    const buffer = Buffer.from(attachment.content, 'base64');

    const filename = `${uuid()}.${attachment.filename}`;
    const filePath = join(folderPath, filename);

    await fs.writeFile(filePath, buffer);

    // Construir URL relativa (ej: /uploads/folder/file.webp)
    const publicUrl =
      '/uploads/' + relative(this.uploadsPath, filePath).replace(/\\/g, '/');

    return { publicUrl };
  }
}
