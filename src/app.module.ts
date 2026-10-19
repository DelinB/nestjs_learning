
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { SongsModule } from './songs/songs.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

@Module({
  imports: [SongsModule],
  providers:[
    {
      provide:APP_FILTER,
      useClass:AllExceptionsFilter
    }
  ]

})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }

}
