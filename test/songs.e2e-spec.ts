import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/setup-app';

describe('Songs (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);              // <-- now the pipe is real in tests
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /songs -> 200 + array', async () => {
    const res = await request(app.getHttpServer()).get('/songs').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /songs/abc -> 400 (ParseIntPipe)', () =>
    request(app.getHttpServer()).get('/songs/abc').expect(400));

  it('GET /songs/999 -> 404', () =>
    request(app.getHttpServer()).get('/songs/999').expect(404));

  it('POST /songs {} -> 400 (missing required fields)', () =>
    request(app.getHttpServer()).post('/songs').send({}).expect(400));

  it('POST /songs with unknown field -> 400 (forbidNonWhitelisted)', () =>
    request(app.getHttpServer())
      .post('/songs')
      .send({
        title: 'X',
        artist: ['A'],
        releasedDate: '2024-01-01',
        duration: '01:00',
        hack: 'nope',
      })
      .expect(400));

  it('POST /songs valid -> 201', () =>
    request(app.getHttpServer())
      .post('/songs')
      .send({ title: 'X', artist: ['A'], releasedDate: '2024-01-01', duration: '01:00' })
      .expect(201));
});