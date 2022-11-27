import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SupplierJwtAuthGuard extends AuthGuard('jwt') {}
