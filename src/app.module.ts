import { Module } from '@nestjs/common';

import { AppService } from '/opt/src/app.service';
import { S3Service } from '/opt/src/libs/services/s3.service';

@Module({
  providers: [AppService, S3Service],
})
export class AppModule {}
