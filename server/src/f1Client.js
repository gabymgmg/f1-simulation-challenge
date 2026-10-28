const BASE_URL = 'https://tech-challenge101.onrender.com';
// The free tier can take up to a minute to wake up
const TIMEOUT_MS = 70_000;

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Calls the F1 API, translates its errors to our status codes
// and returns the data field of the { statusCode, code, message, data } wrapper.
async function fetchFromF1(path) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, { signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createError(504, 'F1 API did not respond in time');
    }
    throw createError(503, 'F1 API is unavailable');
  } finally {
    clearTimeout(timeoutId);
  }

  // The API answers 400 when the raceId has an invalid format: for the user it is a race that does not exist
  if (response.status === 404 || response.status === 400) {
    // Only race endpoints take an id, and the API path is not exposed to the user
    throw createError(404, 'Race not found');
  }
  if (!response.ok) {
    throw createError(503, `F1 API responded with status ${response.status}`);
  }

  const body = await response.json();
  if (!body.data) {
    throw createError(503, 'F1 API returned no data');
  }
  return body.data;
}

export async function getRaces() {
  const { races } = await fetchFromF1('/api/races');
  if (!races || races.length === 0) {
    throw createError(503, 'F1 API returned no races');
  }
  return races;
}

// Returns the race with its circuit embedded
export async function getRace(raceId) {
  // raceId comes from the user, so it is encoded to keep it inside the URL path
  return fetchFromF1(`/api/races/${encodeURIComponent(raceId)}`);
}

export async function getTyres() {
  const { tyres } = await fetchFromF1('/api/tyres');
  if (!tyres || tyres.length === 0) {
    throw createError(503, 'F1 API returned no tyres');
  }
  return tyres;
}

export async function getSimulationParameters(raceId) {
  return fetchFromF1(`/api/races/${encodeURIComponent(raceId)}/simulation-parameters`);
}
