import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
@Injectable()
export class PartsService {
  constructor(private readonly db: DataSource) {}
  async search(query: { q?: string; system?: string; oem?: string }) {
    const where: string[] = []; const params: unknown[] = [];
    if (query.q?.trim()) { const escaped = query.q.trim().replace(/[\\%_]/g, '\\$&'); params.push(`%${escaped}%`); where.push(`(name_en ILIKE $${params.length} ESCAPE E'\\\\' OR name_ar ILIKE $${params.length} ESCAPE E'\\\\' OR canonical_key ILIKE $${params.length} ESCAPE E'\\\\')`); }
    if (query.system?.trim()) { params.push(query.system.trim()); where.push(`system_code = $${params.length}`); }
    if (query.oem?.trim()) { params.push(query.oem.trim()); where.push(`oem_number = $${params.length}`); }
    const filter = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const data = await this.db.query(`SELECT id, canonical_key AS "canonicalKey", system_code AS "systemCode", name_en AS "nameEn", name_ar AS "nameAr", description_en AS "descriptionEn", description_ar AS "descriptionAr", oem_number AS "oemNumber", verification_status AS "verificationStatus", specifications FROM catalog_parts ${filter} ORDER BY name_en ASC LIMIT 100`, params);
    return { data, count: data.length, note: 'Only records actually present in the catalog are returned; no fitment is inferred.' };
  }
}
