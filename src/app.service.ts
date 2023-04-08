import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APIGatewayProxyResult } from 'aws-lambda';
import { extname } from 'path';

import { UploadRequestsDto } from '/opt/src/libs/dtos/requests/upload-requests.dto';
import { EnvironmentInterface } from '/opt/src/libs/interfaces/environment.interface';
import { S3Service } from '/opt/src/libs/services/s3.service';
import { errorResponse, formatResponse } from '/opt/src/libs/utils';

const SERVICE_NAME = 'AppService';

@Injectable()
export class AppService {
  private readonly _bucket: string;

  constructor(
    private readonly _s3Service: S3Service,
    private readonly _configService: ConfigService,
  ) {
    const { bucket }: EnvironmentInterface =
      this._configService.get<EnvironmentInterface>('config');

    this._bucket = bucket;
  }

  async upload({
    file,
    name,
  }: UploadRequestsDto): Promise<APIGatewayProxyResult> {
    try {
      const path = `test/${name}${extname(file.originalName)}`;

      await this._s3Service.upload(
        file.buffer,
        this._bucket,
        path,
        'public-read',
      );

      return formatResponse<string>(
        `https://${this._bucket}.s3.amazonaws.com/${path}`,
        SERVICE_NAME,
      );
    } catch (e) {
      return errorResponse(e, SERVICE_NAME);
    }
  }
}
