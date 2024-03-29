import { S3 } from '@aws-sdk/client-s3';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3/dist-types/commands/PutObjectCommand';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MemoryStoredFile } from 'nestjs-form-data';

import { AppService } from '/opt/src/app.service';
import { UploadRequestsDto } from '/opt/src/libs/dtos/requests/upload-requests.dto';
import { S3Service } from '/opt/src/libs/services/s3.service';
import { BUCKET } from '/opt/src/libs/shared/injectables';
import { errorResponse, formatResponse } from '/opt/src/libs/utils';

const SERVICE_NAME = 'AppService';

describe('AppService', () => {
  const file: MemoryStoredFile = <MemoryStoredFile>{
    buffer: Buffer.from('a buffer'),
    encoding: 'test',
    mimetype: 'test',
    originalName: 'test',
    size: 1,
    delete(): Promise<void> {
      return Promise.resolve(undefined);
    },
  };
  const s3Result: PutObjectCommandOutput = {
    ETag: 'test',
    $metadata: {},
  };
  const createDto: UploadRequestsDto = { file, name: 'test' };
  let service: AppService;
  let s3Service: S3Service;

  beforeEach(async () => {
    global.console = require('console');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        S3Service,
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

    service = module.get<AppService>(AppService);
    s3Service = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('should return location item', async () => {
    jest
      .spyOn(s3Service, 'upload')
      .mockImplementation(
        async (): Promise<PutObjectCommandOutput> => Promise.resolve(s3Result),
      );
    expect(await service.upload(createDto)).toEqual(
      formatResponse<string>(
        'https://test.s3.amazonaws.com/test/test',
        SERVICE_NAME,
      ),
    );
  });

  it('should return error', async () => {
    jest.spyOn(s3Service, 'upload').mockRejectedValue(new Error('Test Error'));
    expect(await service.upload(createDto)).toEqual(
      errorResponse(
        {
          message: 'Test Error',
        },
        SERVICE_NAME,
      ),
    );
  });
});
