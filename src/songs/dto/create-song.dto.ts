import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsString,
  Matches,
} from 'class-validator';

export class CreateSongDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly artist: string[];

  @IsDateString()
  @IsNotEmpty()
  readonly releasedDate: string;

  @IsString()
  @Matches(/^([0-9]{2}):([0-9]{2})$/, {
    message: 'duration must be in mm:ss format',
  })
  readonly duration: string;
}