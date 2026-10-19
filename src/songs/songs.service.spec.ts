import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SongsService } from './songs.service';

describe('SongsService', () => {
  let service: SongsService;

  const dto = {
    title: 'Bohemian Rhapsody',
    artist: ['Queen'],
    releasedDate: '1975-10-31',
    duration: '5:55',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SongsService],
    }).compile();

    service = module.get<SongsService>(SongsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create → assigns an id and stores the song', () => {
    const song = service.create(dto);
    expect(song.id).toBe(1);
    expect(song.title).toBe('Bohemian Rhapsody');
    expect(service.findAll()).toHaveLength(1);
  });

  it('findAll → returns a copy, not the internal reference', () => {
    service.create(dto);
    const all = service.findAll();
    all[0].artist.push('Mutated');          // mutate the returned object
    expect(service.findAll()[0].artist).toEqual(['Queen']); // store is untouched
  });

  it('findOne → throws NotFoundException for missing id', () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
  });

  it('update → patches only provided fields', () => {
    const created = service.create(dto);
    const updated = service.update(created.id, { title: 'New Title' });
    expect(updated.title).toBe('New Title');
    expect(updated.artist).toEqual(['Queen']);
  });

  it('update → throws NotFoundException for missing id', () => {
    expect(() => service.update(999, { title: 'X' })).toThrow(NotFoundException);
  });

  it('remove → deletes and returns { deleted, id }', () => {
    const created = service.create(dto);
    expect(service.remove(created.id)).toEqual({ deleted: true, id: created.id });
    expect(service.findAll()).toHaveLength(0);
  });

  it('remove → throws NotFoundException for missing id', () => {
    expect(() => service.remove(999)).toThrow(NotFoundException);
  });
});
 