import { Test, TestingModule } from '@nestjs/testing';
import * as AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { MemoryStoredFile } from 'nestjs-form-data';

import { S3Service } from '/opt/src/libs/services/s3.service';

describe('S3Service', () => {
  const s3 = Object.getPrototypeOf(new AWS.S3());
  const file: MemoryStoredFile = <MemoryStoredFile>{
    buffer: Buffer.from('a buffer'),
    encoding: 'test',
    mimetype: 'test',
    originalName: 'test',
    size: 1,
  };
  const s3Result: ManagedUpload.SendData = {
    Location: 'test',
    ETag: 'test',
    Bucket: 'test',
    Key: 'test',
  };
  let service: S3Service;

  beforeEach(async () => {
    global.console = require('console');
    const MODULE: TestingModule = await Test.createTestingModule({
      providers: [S3Service],
    }).compile();
    service = MODULE.get<S3Service>(S3Service);
  });

  it('should return s3 item', async () => {
    jest.spyOn(s3, 'upload').mockReturnValue({
      promise: () => Promise.resolve(s3Result),
    });
    expect(await service.upload(file, 'test', 'test')).toEqual(s3Result);
  });
});
