import { Test, TestingModule } from '@nestjs/testing';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { MemoryStoredFile } from 'nestjs-form-data';

import { AppService } from '/opt/src/app.service';
import { UploadRequestsDto } from '/opt/src/libs/interfaces/request/upload-requests.dto';
import { S3Service } from '/opt/src/libs/services/s3.service';
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
  const s3Result: ManagedUpload.SendData = {
    Location: 'test',
    ETag: 'test',
    Bucket: 'test',
    Key: 'test',
  };
  const createDto: UploadRequestsDto = { file, name: 'test' };
  let service: AppService;
  let s3Service: S3Service;

  beforeEach(async () => {
    global.console = require('console');
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, S3Service],
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
        async (): Promise<ManagedUpload.SendData> => Promise.resolve(s3Result),
      );
    expect(await service.upload(createDto)).toEqual(
      formatResponse({ location: s3Result.Location }, SERVICE_NAME),
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
