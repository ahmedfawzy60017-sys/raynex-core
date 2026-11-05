import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { AuditService } from '../audit/audit.service';

const UPDATABLE = ['brandId', 'modelId', 'modelYear', 'marketCode', 'nickname'] as const;

@Injectable()
export class VehiclesService {
  constructor(@InjectRepository(Vehicle) private readonly repo: Repository<Vehicle>, private readonly audit: AuditService) {}

  /** Foreign-key violations (unknown brand/model id) are a client error, not a 500. */
  private rethrow(e: any): never {
    if (e?.code === '23503') throw new BadRequestException('INVALID_CATALOG_REFERENCE');
    throw e;
  }

  async create(ownerUserId: string, dto: CreateVehicleDto) {
    try {
      return await this.repo.manager.transaction(async (m) => {
        const repo = m.getRepository(Vehicle);
        const saved = await repo.save(repo.create({ ownerUserId, brandId: dto.brandId ?? null, modelId: dto.modelId ?? null, modelYear: dto.modelYear ?? null, marketCode: dto.marketCode?.trim().toUpperCase() ?? null, nickname: dto.nickname?.trim() || null }));
        await this.audit.record({ actorUserId: ownerUserId, action: 'vehicle.created', resourceType: 'vehicle', resourceId: saved.id }, m);
        return saved;
      });
    } catch (e) { this.rethrow(e); }
  }

  async findAll(ownerUserId: string, page = 1, limit = 20) {
    const safePage = Math.max(1, Math.floor(page) || 1);
    const safeLimit = Math.min(Math.max(Math.floor(limit) || 20, 1), 100);
    const [data, total] = await this.repo.findAndCount({ where: { ownerUserId, isDeleted: false }, order: { createdAt: 'DESC', id: 'DESC' }, skip: (safePage - 1) * safeLimit, take: safeLimit });
    return { data, meta: { page: safePage, limit: safeLimit, total } };
  }

  async findOne(id: string, ownerUserId: string) {
    const vehicle = await this.repo.findOne({ where: { id, ownerUserId, isDeleted: false } });
    if (!vehicle) throw new NotFoundException('VEHICLE_NOT_FOUND');
    return vehicle;
  }

  async update(id: string, ownerUserId: string, dto: UpdateVehicleDto) {
    try {
      return await this.repo.manager.transaction(async (m) => {
        const repo = m.getRepository(Vehicle);
        const v = await repo.findOne({ where: { id, ownerUserId, isDeleted: false } });
        if (!v) throw new NotFoundException('VEHICLE_NOT_FOUND');
        // Copy only whitelisted fields; never let a request body overwrite ownerUserId/isDeleted/status.
        for (const key of UPDATABLE) if (dto[key] !== undefined) (v as any)[key] = key === 'marketCode' ? String(dto[key]).trim().toUpperCase() : dto[key];
        const saved = await repo.save(v);
        await this.audit.record({ actorUserId: ownerUserId, action: 'vehicle.updated', resourceType: 'vehicle', resourceId: id }, m);
        return saved;
      });
    } catch (e) { this.rethrow(e); }
  }

  async remove(id: string, ownerUserId: string) {
    return this.repo.manager.transaction(async (m) => {
      const repo = m.getRepository(Vehicle);
      const v = await repo.findOne({ where: { id, ownerUserId, isDeleted: false } });
      if (!v) throw new NotFoundException('VEHICLE_NOT_FOUND');
      v.isDeleted = true; await repo.save(v);
      await this.audit.record({ actorUserId: ownerUserId, action: 'vehicle.soft_deleted', resourceType: 'vehicle', resourceId: id }, m);
      return { id, deleted: true, deletionMode: 'soft' };
    });
  }
}
