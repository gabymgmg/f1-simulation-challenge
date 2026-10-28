import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRace } from './f1Client.js';

// Builds the object fetch resolves with, with only the fields f1Client reads
function mockResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe('f1Client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('unwraps data from the API response', async () => {
    const race = { id: 'race-01', name: 'Bahrain Grand Prix', laps: 57 };
    fetch.mockResolvedValue(
      mockResponse(200, { statusCode: 200, code: 'RACE2002', message: 'Race retrieved', data: race })
    );

    expect(await getRace('race-01')).toEqual(race);
  });

  it('returns 404 when the API responds 404', async () => {
    fetch.mockResolvedValue(
      mockResponse(404, { statusCode: 404, code: 'RACE4040', message: 'Race not found' })
    );

    await expect(getRace('race-99')).rejects.toMatchObject({ status: 404 });
  });

  it('returns 404 when the API rejects the raceId format with 400', async () => {
    fetch.mockResolvedValue(
      mockResponse(400, { statusCode: 400, code: 'RACE4000', message: 'Invalid raceId' })
    );

    await expect(getRace('NOT_VALID')).rejects.toMatchObject({ status: 404 });
  });
});
