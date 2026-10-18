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

  create(dto: CreateSongDto): Song {
    const song: Song = { id: this.nextId++, ...dto };
    this.songs.push(song);
    return song;
  }

  findAll(): Song[] {
    return this.songs.map((s) => ({ ...s }));
  }

  findOne(id: number): Song {
    const song = this.songs.find((s) => s.id === id);
    if (!song) {
      throw new NotFoundException(`Song with id ${id} not found`);
    }
    return { ...song };
  }

  update(id: number, dto: UpdateSongDto): Song {
    const index = this.songs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Song with id ${id} not found`);
    }

    // Keep only fields the client actually sent
    const patch = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    ) as Partial<Song>;

    this.songs[index] = { ...this.songs[index], ...patch };
    return { ...this.songs[index] };
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