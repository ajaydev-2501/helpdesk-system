import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

/**
 * Custom ParseUUID or ParseInt pipe wrapper placeholder
 */
@Injectable()
export class ParseIdPipe implements PipeTransform<string, string> {
  transform(value: string, _metadata: ArgumentMetadata): string {
    return value;
  }
}
