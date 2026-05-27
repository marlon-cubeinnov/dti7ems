import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Uploads a buffer to Google Drive using a service account.
 * Returns the public sharing URL of the uploaded file.
 *
 * Required env vars:
 *   GOOGLE_DRIVE_CLIENT_EMAIL  — service account email
 *   GOOGLE_DRIVE_PRIVATE_KEY   — service account private key (PEM, newlines as \n)
 *   GOOGLE_DRIVE_FOLDER_ID     — Drive folder ID to upload into (optional)
 */
export async function uploadToGoogleDrive(options: {
  filename: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<string> {
  const clientEmail = process.env['GOOGLE_DRIVE_CLIENT_EMAIL'];
  const privateKey  = process.env['GOOGLE_DRIVE_PRIVATE_KEY']?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google Drive credentials are not configured. Set GOOGLE_DRIVE_CLIENT_EMAIL and GOOGLE_DRIVE_PRIVATE_KEY in .env');
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });
  const folderId = process.env['GOOGLE_DRIVE_FOLDER_ID'] || undefined;

  // Upload the file
  const uploadRes = await drive.files.create({
    requestBody: {
      name: options.filename,
      mimeType: options.mimeType,
      ...(folderId ? { parents: [folderId] } : {}),
    },
    media: {
      mimeType: options.mimeType,
      body: Readable.from(options.buffer),
    },
    fields: 'id,name',
  });

  const fileId = uploadRes.data.id;
  if (!fileId) throw new Error('Google Drive upload returned no file ID');

  // Make the file publicly viewable (anyone with the link)
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Return a direct view link
  return `https://drive.google.com/file/d/${fileId}/view`;
}
