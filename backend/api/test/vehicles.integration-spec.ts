import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { User } from '../src/users.entity';
import { Vehicle } from '../src/vehicles/vehicle.entity';
import { VehiclesService } from '../src/vehicles/vehicles.service';
import { AuditService } from '../src/audit/audit.service';

describe('Vehicles PostgreSQL persistence', () => {
  let service: VehiclesService; let dataSource: DataSource; let ownerUserId: string;
  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot({ type: 'postgres', host: process.env.TEST_DB_HOST ?? 'localhost', port: Number(process.env.TEST_DB_PORT ?? 5432), username: process.env.TEST_DB_USER ?? 'raynex', password: process.env.TEST_DB_PASSWORD ?? 'raynex_dev_password', database: process.env.TEST_DB_NAME ?? 'raynex_test', entities: [User, Vehicle], synchronize: false /* schema comes from `pnpm migration:run` */ }), TypeOrmModule.forFeature([Vehicle, User])],
      providers: [VehiclesService, { provide: AuditService, useValue: { record: jest.fn().mockResolvedValue(undefined) } }],
    }).compile();
    service = mod.get(VehiclesService); dataSource = mod.get(DataSource);
    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.save(userRepo.create({ email: `integration-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@raynex.test`, passwordHash: 'test-hash' }));
    ownerUserId = user.id;
  });
  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.query('DELETE FROM vehicles WHERE owner_user_id = $1', [ownerUserId]);
      await dataSource.query('DELETE FROM users WHERE id = $1', [ownerUserId]);
      await dataSource.destroy();
    }
  });
  it('persists and retrieves a vehicle for its owner', async () => {
    const created = await service.create(ownerUserId, { nickname: 'Integration test car', modelYear: 2020 });
    const found = await service.findOne(created.id, ownerUserId);
    expect(found.id).toBe(created.id); expect(found.nickname).toBe('Integration test car');
  });
  it('does not expose another owner vehicle', async () => {
    const created = await service.create(ownerUserId, { nickname: 'Private vehicle' });
    await expect(service.findOne(created.id, '22222222-2222-4222-8222-222222222222')).rejects.toThrow('VEHICLE_NOT_FOUND');
  });
});
