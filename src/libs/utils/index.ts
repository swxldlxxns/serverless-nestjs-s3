import { HttpStatus, ValidationError } from '@nestjs/common';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { validate } from 'class-validator';
import { isEmpty, isObject } from 'lodash';
import { MemoryStoredFile } from 'nestjs-form-data';

const BUSBOY = require('busboy');

export async function validateDto<T>(
  DTO: ClassConstructor<T>,
  param: object,
): Promise<T> {
  return plainToInstance(DTO, param, {
    excludeExtraneousValues: true,
  });
}

export async function errorsDto(data): Promise<ValidationError[]> {
  return await validate(<object>(<unknown>data));
}

export function isJsonString(str: any): boolean {
  try {
    return !isEmpty(str) && isObject(JSON.parse(str));
  } catch {
    return false;
  }
}

export function formatResponse<T>(
  response: T,
  SERVICE_NAME: string,
  statusCode: HttpStatus = HttpStatus.OK,
): APIGatewayProxyResult {
  log('INFO', { SERVICE_NAME, response });

  return {
    statusCode,
    body: JSON.stringify(response),
  };
}

export function errorResponse(
  catchErrors,
  SERVICE_NAME: string,
  statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
): APIGatewayProxyResult {
  log('ERROR', { SERVICE_NAME, catchErrors });

  return formatResponse(
    {
      errors: isJsonString(catchErrors.message)
        ? JSON.parse(catchErrors.message)
        : catchErrors.message,
    },
    SERVICE_NAME,
    statusCode,
  );
}

export async function parseFormData(event: APIGatewayEvent): Promise<{
  file?: MemoryStoredFile;
  fields: Record<string, any>;
}> {
  return new Promise((resolve) => {
    try {
      const busboy = BUSBOY({
        headers: { 'content-type': event.headers['Content-Type'] },
      });
      const fields: Record<string, any> = {};
      let uploadedFile: MemoryStoredFile;

      busboy.on('field', (fieldName, value) => {
        fields[fieldName] = value;
      });
      busboy.on('file', (name, file, info) => {
        const { filename: originalName, mimeType: mimetype, encoding } = info;
        let buffer;
        let size;

        file.on('data', (data) => {
          buffer = data;
          size = data.length;
        });
        file.on('end', () => {
          uploadedFile = <MemoryStoredFile>{
            buffer,
            encoding,
            mimetype,
            originalName,
            size,
            delete(): Promise<void> {
              return Promise.resolve(undefined);
            },
          };
        });
      });
      busboy.on('finish', () => {
        resolve({ file: uploadedFile, fields });
      });
      busboy.write(
        event.body || '',
        event.isBase64Encoded ? 'base64' : 'binary',
      );
      busboy.end();
    } catch {
      resolve({
        file: <MemoryStoredFile>{},
        fields: {},
      });
    }
  });
}

export function log(type: 'INFO' | 'ERROR', data: object): void {
  switch (type) {
    case 'INFO':
      console.info(data);
      break;
    case 'ERROR':
      console.error(data);
      break;
  }
}
