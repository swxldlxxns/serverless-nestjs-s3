import { S3 } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';

import { AppService } from '/opt/src/app.service';
import config from '/opt/src/config';
import { S3Service } from '/opt/src/libs/services/s3.service';
import { BUCKET } from '/opt/src/libs/shared/injectables';

const apiVersion = 'latest';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
      isGlobal: true,
    }),
  ],
  providers: [
    AppService,
    S3Service,
    {
      provide: BUCKET,
      inject: [config.KEY],
      useFactory: ({ region }: ConfigType<typeof config>) =>
        new S3({
          apiVersion,
          region,
        }),
    },
  ],
})
export class AppModule {}
