import { S3 } from '@aws-sdk/client-s3';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3/dist-types/commands/PutObjectCommand';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MemoryStoredFile } from 'nestjs-form-data';

import { S3Service } from '/opt/src/libs/services/s3.service';
import { BUCKET } from '/opt/src/libs/shared/injectables';

describe('S3Service', () => {
  const file: MemoryStoredFile = <MemoryStoredFile>{
    buffer: Buffer.from('a buffer'),
    encoding: 'test',
    mimetype: 'test',
    originalName: 'test',
    size: 1,
  };
  const s3Result: PutObjectCommandOutput = {
    ETag: 'test',
    $metadata: {},
  };
  let service: S3Service;
  let s3: S3;

  beforeEach(async () => {
    global.console = require('console');
    const MODULE: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        S3,
        {
          provide: ConfigService,
          useFactory: () => ({
            get: () => ({
              accountId: process.env.ACCOUNT_ID,
              stage: process.env.STAGE,
              region: process.env.REGION,
              bucket: process.env.BUCKET,
            }),
          }),
        },
        {
          provide: BUCKET,
          useValue: S3,
        },
      ],
    }).compile();

    service = MODULE.get<S3Service>(S3Service);
    s3 = MODULE.get<S3>(BUCKET);
  });

  it('should return s3 item', async () => {
    s3.putObject = jest.fn().mockResolvedValue(s3Result);
    expect(await service.upload(file.buffer, 'test', 'test')).toEqual(s3Result);
  });
});
