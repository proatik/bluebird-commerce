import type { ZodType } from 'zod';
import {
  Injectable,
  BadRequestException,
  type PipeTransform,
  type ArgumentMetadata
} from '@nestjs/common';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    const schema = (metadata.metatype as { schema?: ZodType } | undefined)?.schema;

    if (!schema) {
      return value;
    }

    const result = schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException(result.error.issues);
    }

    return result.data;
  }
}
