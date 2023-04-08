import { ObjectCannedACL, S3 } from '@aws-sdk/client-s3';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3/dist-types/commands/PutObjectCommand';
import { Inject, Injectable } from '@nestjs/common';

import { BUCKET } from '/opt/src/libs/shared/injectables';
import { log } from '/opt/src/libs/utils';

const SERVICE_NAME = 'S3Service';

@Injectable()
export class S3Service {
  constructor(@Inject(BUCKET) private readonly _s3: S3) {}

  async upload(
    Body: string | Uint8Array | Buffer,
    Bucket: string,
    Key: string,
    ACL: ObjectCannedACL = 'private',
  ): Promise<PutObjectCommandOutput> {
    log('INFO', {
      SERVICE_NAME,
      params: {
        ACL,
        Body,
        Bucket,
        Key,
      },
    });

    return await this._s3.putObject({
      ACL,
      Body,
      Bucket,
      Key,
    });
  }
}
