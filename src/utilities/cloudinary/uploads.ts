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

export const uploadFile = async (file: any) => {
	const ext = file?.originalname?.split('.').pop()?.toLowerCase();
	const mimeType = file?.mimetype;
	const sanitizedName = decodeURIComponent(file.originalname)
		.replace(/\s+/g, '-')
		.replace(/[^a-zA-Z0-9._-]/g, '');

	let resourceType: any = 'auto';

	if (mimeType === 'application/pdf' || ext === 'pdf') {
		resourceType = 'raw';
	} else if (ext === 'csv') {
		resourceType = 'raw';
	} else if (mimeType?.startsWith('image/')) {
		resourceType = 'image';
	}

	return cloudinary.v2.uploader
		.upload(file.path, {
			resource_type: resourceType,
			public_id:
				resourceType === 'raw'
					? `${Date.now()}-${sanitizedName}`
					: `${Date.now()}-${sanitizedName.replace(/\.[^/.]+$/, '')}`,
			...(resourceType === 'raw' && {
				format: ext,
			}),
		})
		.then((result) => {
			console.log(
				`Upload successful: ${result.secure_url}, resource_type: ${result.resource_type}`
			);
			return result.secure_url;
		})
		.catch((e) => {
			console.error('Cloudinary upload error:', e);
			throw new Error('Failed to upload file');
		});
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