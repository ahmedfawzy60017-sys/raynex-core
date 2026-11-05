import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'vehicles' })
@Index('idx_vehicles_owner_created', ['ownerUserId', 'createdAt'])
export class Vehicle {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ name: 'owner_user_id', type: 'uuid' }) ownerUserId: string;
  @Column({ name: 'is_deleted', type: 'boolean', default: false }) isDeleted: boolean;
  @Column({ name: 'brand_id', type: 'uuid', nullable: true }) brandId: string | null;
  @Column({ name: 'model_id', type: 'uuid', nullable: true }) modelId: string | null;
  @Column({ name: 'model_year', type: 'smallint', nullable: true }) modelYear: number | null;
  @Column({ name: 'market_code', type: 'varchar', length: 8, nullable: true }) marketCode: string | null;
  @Column({ name: 'nickname', type: 'varchar', length: 80, nullable: true }) nickname: string | null;
  @Column({ name: 'vin_hash', type: 'varchar', length: 128, nullable: true, select: false }) vinHash: string | null;
  @Column({ name: 'verification_status', type: 'varchar', length: 32, default: 'unverified' }) verificationStatus: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
