import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { MemoryStoredFile } from 'nestjs-form-data';

import { CustomRules } from '/opt/src/libs/services/validation.service';

export class CreateRequestsDto {
  @Validate(CustomRules)
  @Expose()
  readonly file: MemoryStoredFile;

  @IsNotEmpty()
  @IsString()
  @Expose()
  readonly name: string;
}
