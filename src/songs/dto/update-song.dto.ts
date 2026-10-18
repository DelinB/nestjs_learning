import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class UpdateSongDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly title?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly artist?: string[];

  @IsOptional()
  @IsDateString()
  readonly releasedDate?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-9]{2}):([0-9]{2})$/, {
    message: 'duration must be in mm:ss format',
  })
  readonly duration?: string;
}