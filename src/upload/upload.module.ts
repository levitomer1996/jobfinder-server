import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Pdf, PdfSchema } from './Schemas/pdf.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'tomer',
      signOptions: { expiresIn: '24h' }, // ✅ Set token expiration
    }),
    MongooseModule.forFeature([{ name: Pdf.name, schema: PdfSchema }]),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
