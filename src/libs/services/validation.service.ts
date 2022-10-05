import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint } from 'class-validator';
import { get } from 'lodash';
import { MemoryStoredFile } from 'nestjs-form-data';

const imagesMimeTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png'];

@ValidatorConstraint({ name: 'CustomRules', async: true })
@Injectable()
export class CustomRules {
  async validate(attr: MemoryStoredFile | string, args: ValidationArguments) {
    const property = get(args, 'property');

    switch (true) {
      case property === 'file':
        return imagesMimeTypes.includes(get(attr, 'mimetype'));
    }
  }

  defaultMessage(args: ValidationArguments) {
    const property = get(args, 'property');

    switch (true) {
      case property === 'file':
        return `${property} must be a file (${imagesMimeTypes.join(', ')})`;
    }
  }
}
