import { Request } from 'express';
import { ParsedQs } from 'qs';
import { ParamsDictionary } from 'express-serve-static-core';

export const fileNamer = (
  req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
  file: Express.Multer.File,
  callback: (error: Error | null, fileName: string) => void,
) => {
  const extension = file.mimetype.split('/')[1];
  const randomName = Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');

  callback(null, `${randomName}.${extension}`);
};
