
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { SongsModule } from './songs/songs.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [SongsModule],

})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }

}
