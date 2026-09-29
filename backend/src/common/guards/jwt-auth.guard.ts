import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Protects endpoints requiring a valid JWT Bearer token in the Authorization header.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
