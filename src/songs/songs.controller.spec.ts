import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';

describe('SongsService', () => {
  let service: SongsService;

  // helper so each test only states the fields it cares about
  const dto = (over: Partial<CreateSongDto> = {}) =>
    ({
      title: 'Song',
      artist: ['Artist'],
      releasedDate: '2024-01-01',
      duration: '03:00',
      ...over,
    }) as CreateSongDto;

  beforeEach(async () => {
    // compiled fresh per test => nextId resets to 1, no state leaks between tests
    const module: TestingModule = await Test.createTestingModule({
      providers: [SongsService],
    }).compile();

    service = module.get<SongsService>(SongsService);
  });

  describe('create', () => {
    it('assigns sequential ids starting at 1', () => {
      const a = service.create(dto({ title: 'A' }));
      const b = service.create(dto({ title: 'B' }));

      expect(a.id).toBe(1);
      expect(b.id).toBe(2);
      expect(a.title).toBe('A');
    });

    it('stores the song', () => {
      const created = service.create(dto());
      expect(service.findOne(created.id)).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('returns [] initially', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('returns every song in insertion order', () => {
      service.create(dto({ title: 'A' }));
      service.create(dto({ title: 'B' }));

      expect(service.findAll().map((s) => s.title)).toEqual(['A', 'B']);
    });

    it('does not expose the internal array', () => {
      service.create(dto());
      const result = service.findAll();

      result.pop(); // caller mutates what it got back

      expect(service.findAll()).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for an unknown id', () => {
      expect(() => service.findOne(999)).toThrow(NotFoundException);
      expect(() => service.findOne(999)).toThrow('Song with id 999 not found');
    });
  });

  describe('update', () => {
    it('merges only the provided fields', () => {
      const song = service.create(dto({ title: 'Old', duration: '01:00' }));

      const updated = service.update(song.id, { title: 'New' } as any);

      expect(updated.title).toBe('New');
      expect(updated.duration).toBe('01:00'); // untouched
      expect(updated.id).toBe(song.id);
    });

    it('ignores explicitly undefined fields', () => {
      const song = service.create(dto({ title: 'Old' }));

      const updated = service.update(song.id, { title: undefined } as any);

      expect(updated.title).toBe('Old');
    });

    it('persists the change', () => {
      const song = service.create(dto({ title: 'Old' }));
      service.update(song.id, { title: 'New' } as any);

      expect(service.findOne(song.id).title).toBe('New');
    });

    it('throws NotFoundException for an unknown id', () => {
      expect(() => service.update(42, { title: 'x' } as any)).toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes the song and confirms', () => {
      const song = service.create(dto());

      expect(service.remove(song.id)).toEqual({ deleted: true, id: song.id });
      expect(service.findAll()).toHaveLength(0);
    });

    it('throws NotFoundException for an unknown id', () => {
      expect(() => service.remove(7)).toThrow(NotFoundException);
    });

    it('does not reuse ids after a delete', () => {
      const a = service.create(dto());
      service.remove(a.id);

      expect(service.create(dto()).id).toBe(2);
    });
  });
});