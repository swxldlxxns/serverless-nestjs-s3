import { Injectable } from '@nestjs/common';
import { APIGatewayProxyResult } from 'aws-lambda';
import { ManagedUpload } from 'aws-sdk/clients/s3';

import { UploadRequestsDto } from '/opt/src/libs/interfaces/request/upload-requests.dto';
import { UploadResponseInterface } from '/opt/src/libs/interfaces/response/upload-response.interface';
import { S3Service } from '/opt/src/libs/services/s3.service';
import { errorResponse, formatResponse } from '/opt/src/libs/utils';

const SERVICE_NAME = 'AppService';

@Injectable()
export class AppService {
  constructor(private readonly _s3Service: S3Service) {}
  async upload({
    file,
    name,
  }: UploadRequestsDto): Promise<APIGatewayProxyResult> {
    try {
      const { Location: location }: ManagedUpload.SendData =
        await this._s3Service.upload(file, 'test', name, 'public-read');
      return formatResponse<UploadResponseInterface>(
        { location },
        SERVICE_NAME,
      );
    } catch (e) {
      return errorResponse(e, SERVICE_NAME);
    }
  }
}
