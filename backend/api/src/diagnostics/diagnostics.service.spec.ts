import { BadRequestException } from '@nestjs/common';
import { DiagnosticsService } from './diagnostics.service';
import { AuditService } from '../audit/audit.service';

/** Minimal DataSource double: transaction() runs the callback against the same mocked manager. */
function makeDb(query: jest.Mock) {
  const db: any = { query, transaction: jest.fn(async (cb: (m: unknown) => unknown) => cb(db)) };
  return db;
}

describe('DiagnosticsService', () => {
  it('accepts only manual-source DTOs at the controller boundary (service contract is manual)', async () => {
    const db = makeDb(jest.fn().mockResolvedValue([{ id: 'session-1' }]));
    const audit = { record: jest.fn().mockResolvedValue(undefined) } as unknown as AuditService;
    const service = new DiagnosticsService(db, audit);
    await service.create('owner-1', { vehicleId: 'vehicle-1', source: 'manual' });
    expect(db.query).toHaveBeenCalledTimes(2);
    expect(db.query.mock.calls[1][1][2]).toBe('manual');
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'diagnostic.manual_recorded' }), db);
  });
  it('rejects non-manual sources until a trusted connector exists', async () => {
    const db = makeDb(jest.fn()); const audit = { record: jest.fn() } as unknown as AuditService;
    const service = new DiagnosticsService(db, audit);
    await expect(service.create('owner-1', { vehicleId: 'vehicle-1', source: 'obd_live' as any })).rejects.toBeInstanceOf(BadRequestException);
    expect(db.query).not.toHaveBeenCalled();
  });
  it('does not distinguish a missing vehicle from a vehicle owned by another account', async () => {
    const db = makeDb(jest.fn().mockResolvedValue([]));
    const audit = { record: jest.fn() } as unknown as AuditService;
    const service = new DiagnosticsService(db, audit);
    await expect(service.create('owner-1', { vehicleId: 'vehicle-foreign', source: 'manual' })).rejects.toThrow('VEHICLE_NOT_FOUND');
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(audit.record).not.toHaveBeenCalled();
  });
  it('upper-cases and de-duplicates DTC codes', async () => {
    const db = makeDb(jest.fn().mockResolvedValue([{ id: 'session-1' }]));
    const audit = { record: jest.fn().mockResolvedValue(undefined) } as unknown as AuditService;
    const service = new DiagnosticsService(db, audit);
    await service.create('owner-1', { vehicleId: 'v', source: 'manual', dtcCodes: [{ code: 'p0300' }, { code: 'P0300' }, { code: 'p0420' }] });
    const stored = JSON.parse(db.query.mock.calls[1][1][4]);
    expect(stored.map((c: { code: string }) => c.code)).toEqual(['P0300', 'P0420']);
  });
});
