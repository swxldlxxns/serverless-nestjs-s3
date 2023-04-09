import { Test, TestingModule } from '@nestjs/testing';
import { ValidationArguments } from 'class-validator';
import { MemoryStoredFile } from 'nestjs-form-data';

import { CustomRules } from '/opt/src/libs/services/validation.service';

const imagesMimeTypes: string[] = ['image/jpeg', 'image/jpg', 'image/png'];

describe('CustomRules', () => {
  const imageFile: MemoryStoredFile = <MemoryStoredFile>{
    buffer: Buffer.from('a buffer'),
    encoding: 'test',
    mimetype: 'image/jpg',
    originalName: 'test',
    size: 1,
    delete(): Promise<void> {
      return Promise.resolve(undefined);
    },
  };
  const args: ValidationArguments = {
    constraints: [],
    object: undefined,
    property: '',
    targetName: '',
    value: undefined,
  };
  let service: CustomRules;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomRules],
    }).compile();

    service = module.get<CustomRules>(CustomRules);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validate', () => {
    it('file', async () => {
      args.property = 'file';
      expect(await service.validate(imageFile, args)).toEqual(true);
    });
  });
  describe('defaultMessage', () => {
    it('file', () => {
      args.property = 'file';
      expect(service.defaultMessage(args)).toEqual(
        `${args.property} must be a file (${imagesMimeTypes.join(', ')})`,
      );
    });
  });
});
