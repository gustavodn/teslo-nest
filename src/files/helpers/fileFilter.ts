import { Request } from 'express';

export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  console.log('fileFilter', file);
  if (!file) return callback(null, false);
  const extensionsAllowed = ['png'];
  const extension = file.mimetype.split('/')[1];
  if (!extensionsAllowed.includes(extension)) return callback(null, false);
  console.log('fileFilter', extension);

  callback(null, true);
};
