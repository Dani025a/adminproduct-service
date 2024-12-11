import { Storage } from '@google-cloud/storage';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

const bucket = storage.bucket(process.env.GCLOUD_BUCKET_NAME as string);

export const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const blob = bucket.file(`images/${uuidv4()}-${path.basename(file.originalname)}`);
    const blobStream = blob.createWriteStream({ resumable: false });

    blobStream
      .on('error', (err) => reject(err))
      .on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      })
      .end(file.buffer);
  });
};