import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { ManagedUpload, ObjectCannedACL } from 'aws-sdk/clients/s3';
import { MemoryStoredFile } from 'nestjs-form-data';
import { extname } from 'path';

import { EnvironmentInterface } from '/opt/src/libs/interfaces/environment.interface';
import { BUCKET } from '/opt/src/libs/shared/injectables';
import { log } from '/opt/src/libs/utils';

const SERVICE_NAME = 'S3Service';

@Injectable()
export class S3Service {
  private readonly _bucket: string;

  constructor(
    @Inject(BUCKET) private readonly _s3: S3,
    private readonly _configService: ConfigService,
  ) {
    const { bucket }: EnvironmentInterface =
      this._configService.get<EnvironmentInterface>('config');

    this._bucket = bucket;
  }

  async upload(
    file: MemoryStoredFile,
    path: string,
    fileName: string,
    ACL: ObjectCannedACL = 'private',
  ): Promise<ManagedUpload.SendData> {
    log('INFO', {
      SERVICE_NAME,
      params: {
        path,
        fileName,
        file,
        bucket: this._bucket,
      },
    });

    return await this._s3
      .upload({
        ACL,
        Bucket: `${this._bucket}/${path}`,
        Key: `${fileName}${extname(file.originalName)}`,
        Body: file.buffer,
      })
      .promise();
  }
}
