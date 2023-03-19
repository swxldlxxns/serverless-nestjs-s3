import { registerAs } from '@nestjs/config';

import { EnvironmentInterface } from '/opt/src/libs/interfaces/environment.interface';

export default registerAs(
  'config',
  (): EnvironmentInterface => ({
    accountId: process.env.ACCOUNT_ID,
    stage: process.env.STAGE,
    region: process.env.REGION,
    bucket: process.env.BUCKET,
  }),
);
