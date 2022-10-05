import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ManagedUpload, ObjectCannedACL } from 'aws-sdk/clients/s3';
import { MemoryStoredFile } from 'nestjs-form-data';
import { extname } from 'path';

import { ENV_VARS } from '/opt/src/libs/shared/enviroments';

const SERVICE_NAME = 'S3Service';
const { bucket, region } = ENV_VARS;
const s3 = new S3({
  region,
  apiVersion: 'latest',
});

@Injectable()
export class S3Service {
  async upload(
    file: MemoryStoredFile,
    path: string,
    fileName: string,
    ACL: ObjectCannedACL = 'private',
  ): Promise<ManagedUpload.SendData> {
    console.log({
      SERVICE_NAME,
      params: {
        bucket,
        path,
        fileName,
        file,
      },
    });

    return await s3
      .upload({
        ACL,
        Bucket: `${bucket}/${path}`,
        Key: `${fileName}${extname(file.originalName)}`,
        Body: file.buffer,
      })
      .promise();
  }
}
