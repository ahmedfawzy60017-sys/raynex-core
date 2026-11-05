import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

export interface AuditInput {
  actorUserId?: string; action: string; resourceType: string; resourceId?: string;
  outcome?: 'success' | 'failure'; metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly db: DataSource) {}
  /** Pass the active EntityManager so the audit row commits or rolls back together with the business change. */
  async record(input: AuditInput, manager?: EntityManager) {
    const runner = manager ?? this.db;
    await runner.query(
      `INSERT INTO audit_events (actor_user_id, action, resource_type, resource_id, outcome, metadata)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
      [input.actorUserId ?? null, input.action, input.resourceType, input.resourceId ?? null, input.outcome ?? 'success', JSON.stringify(input.metadata ?? {})],
    );
  }
}
