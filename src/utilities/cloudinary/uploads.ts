/* eslint-disable @typescript-eslint/no-explicit-any */
import cloudinary from 'cloudinary';
import { Readable } from 'stream';
import configurations from '../../configurations';
import fs from "fs";

cloudinary.v2.config({
	cloud_name: `${configurations.CLOUDINARY_CLOUD_NAME}`,
	api_key: `${configurations.CLOUDINARY_API_KEY}`,
	api_secret: `${configurations.CLOUDINARY_API_SECRET}`,
});

export const uploadFile = async (file: any, resourceType: 'raw' | 'image' | 'video' | 'auto' = 'auto') => {
  try {
    const result = await cloudinary.v2.uploader.upload(file.path, {
      resource_type: resourceType,
      public_id: file?.originalname,
    });
    return result.url;
  } catch (e) {
    console.error(e);
  } finally {
    fs.unlink(file.path, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });
  }
};

export const uploadAnyFile = async (file: any) => {
	const ext = file?.originalname?.split('.').pop()?.toLowerCase();

	// Use 'raw' only for CSV or unknown files, otherwise auto for PDF
	const resourceType = ext === 'csv' ? 'raw' : 'auto';

	return cloudinary.v2.uploader
		.upload(file.path, {
			resource_type: resourceType,
			public_id: file?.originalname,
		})
		.then((result) => result.url)
		.catch((e) => {
			console.error(e);
			throw new Error('Failed to upload file');
		});
};


export const uploadImageWithLink = async (link: any) => {
	return cloudinary.v2.uploader
		.upload(link)
		.then((result) => {
			return result.url;
		})
		.catch((e) => {
			console.error(e);
		});
};

export function clearOldFilesOnServer() {
	try {
		console.log('run clear files');
	} catch (e) {
		console.error(e);
	}
}

export const uploadFileBuffer = async (
	buffer: Buffer,
	publicId: string,
	resourceType: 'raw' | 'image' | 'video' = 'raw'
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.v2.uploader.upload_stream(
			{
				resource_type: resourceType,
				public_id: publicId,
			},
			(error, result) => {
				if (error || !result) return reject(error);
				resolve(result.secure_url);
			}
		);

		// Convert buffer to a readable stream and pipe to Cloudinary
		const readable = new Readable();
		readable.push(buffer);
		readable.push(null);
		readable.pipe(uploadStream);
	});
};