import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 254 }) email: string;
  @Column({ name: 'password_hash', type: 'varchar', length: 255, select: false }) passwordHash: string;
  @Column({ name: 'display_name', type: 'varchar', length: 120, nullable: true }) displayName: string | null;
  @Column({ type: 'varchar', length: 24, default: 'active' }) status: string;
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' }) updatedAt: Date;
}
