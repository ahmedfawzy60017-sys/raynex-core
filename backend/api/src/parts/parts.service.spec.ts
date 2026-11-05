import { PartsService } from './parts.service';
describe('PartsService search', () => {
  it('escapes SQL LIKE wildcard characters and bounds results', async () => {
    const db = { query: jest.fn().mockResolvedValue([]) };
    const service = new PartsService(db as any);
    await service.search({ q: 'brake_%\\pad' });
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toContain('LIMIT 100');
    expect(sql).toContain("ESCAPE E'\\\\'");
    expect(params[0]).toContain('\\_');
    expect(params[0]).toContain('\\%');
  });
});
