import { Test, TestingModule } from '@nestjs/testing';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';

describe('SongsController', () => {
  let controller: SongsController;

  // every method mocked — the controller test asserts *delegation*, not logic
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongsController],
      providers: [{ provide: SongsService, useValue: service }], // <-- the fix
    }).compile();

    controller = module.get<SongsController>(SongsController);
  });

  it('findAll delegates to the service', async () => {
    const songs = [{ id: 1 }] as any;
    service.findAll.mockResolvedValue(songs);

    await expect(controller.findAll()).resolves.toBe(songs);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it('findOne passes the id through', async () => {
    service.findOne.mockResolvedValue({ id: 5 } as any);

    await expect(controller.findOne(5)).resolves.toEqual({ id: 5 });
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('create passes the dto through', async () => {
    const dto = { title: 'X' } as any;
    service.create.mockResolvedValue({ id: 1, ...dto });

    await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('replace and update both forward (id, dto) to service.update', async () => {
    service.update.mockResolvedValue({ id: 3 } as any);
    const dto = { title: 'N' } as any;

    await controller.replace(3, dto);
    await controller.update(3, dto);

    expect(service.update).toHaveBeenNthCalledWith(1, 3, dto);
    expect(service.update).toHaveBeenNthCalledWith(2, 3, dto);
  });

  it('remove passes the id through', async () => {
    service.remove.mockResolvedValue({ deleted: true, id: 2 });

    await expect(controller.remove(2)).resolves.toEqual({
      deleted: true,
      id: 2,
    });
    expect(service.remove).toHaveBeenCalledWith(2);
  });
});