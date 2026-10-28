// Calls our server. On error it throws with the status, so the UI can choose what to show.
export async function fetchJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();

  if (!response.ok) {
    const error = new Error(body.message);
    error.status = response.status;
    error.errors = body.errors; // only present on 422
    throw error;
  }
  return body;
}

export function errorMessageFor(error) {
  if (error.status === 404) {
    return 'Race not found';
  }
  if (error.status === 503 || error.status === 504) {
    return 'The data service is waking up or unavailable, try again in a few seconds';
  }
  return 'Something went wrong, please try again';
}
