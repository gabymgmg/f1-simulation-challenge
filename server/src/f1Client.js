const BASE_URL = 'https://tech-challenge101.onrender.com';

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Calls the F1 API, translates its errors to our status codes
// and returns the data field of the { statusCode, code, message, data } wrapper.
async function fetchFromF1(path) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`);
  } catch {
    throw createError(503, 'F1 API is unavailable');
  }

  // The API answers 400 when the raceId has an invalid format: for the user it is a race that does not exist
  if (response.status === 404 || response.status === 400) {
    throw createError(404, `Not found in F1 API: ${path}`);
  }
  if (!response.ok) {
    throw createError(503, `F1 API responded with status ${response.status}`);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw createError(503, 'F1 API returned an invalid response');
  }

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
