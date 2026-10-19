import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

export interface Song {
  id: number;
  title: string;
  artist: string[];
  releasedDate: string;
  duration: string;
}

@Injectable()
export class SongsService {
  private readonly songs: Song[] = [];
  private nextId = 1;

  /** Deep-ish clone: copies the array so callers can't mutate the store. */
  private clone(song: Song): Song {
    return { ...song, artist: [...song.artist] };
  }

  create(dto: CreateSongDto): Song {
    const song: Song = {
      id: this.nextId++,
      title: dto.title,
      artist: [...dto.artist],       // copy the caller's array
      releasedDate: dto.releasedDate,
      duration: dto.duration,
    };
    this.songs.push(song);
    return this.clone(song);         // never leak the internal reference
  }

  findAll(): Song[] {
    return this.songs.map((s) => this.clone(s));
  }

  findOne(id: number): Song {
    const song = this.songs.find((s) => s.id === id);
    if (!song) {
      throw new NotFoundException(`Song with id ${id} not found`);
    }
    return this.clone(song);
  }

  update(id: number, dto: UpdateSongDto): Song {
    const index = this.songs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Song with id ${id} not found`);
    }

    const patch = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    ) as Partial<Song>;

    const merged: Song = { ...this.songs[index], ...patch };
    if (patch.artist) {
      merged.artist = [...patch.artist];  // copy the incoming array
    }

    this.songs[index] = merged;
    return this.clone(merged);
  }

  remove(id: number): { deleted: true; id: number } {
    const index = this.songs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Song with id ${id} not found`);
    }
    this.songs.splice(index, 1);
    return { deleted: true, id };
  }
}