// Calls our server. On error it throws with the status, so the UI can choose what to show.
export async function fetchJson(url, options) {
  let response;
  let body;
  try {
    response = await fetch(url, options);
    body = await response.json();
  } catch {
    // No JSON answer: our server is down (the Vite proxy answers with an empty 500) or there is no network
    const error = new Error("Can't reach the server");
    error.serverUnreachable = true;
    throw error;
  }

  if (!response.ok) {
    const error = new Error(body.message);
    error.status = response.status;
    error.errors = body.errors; // only present on 422
    throw error;
  }
  return body;
}

export function errorMessageFor(error) {
  if (error.serverUnreachable) {
    return "Can't reach the server. Check that it is running and try again.";
  }
  if (error.status === 404) {
    return 'Race not found';
  }
  if (error.status === 503 || error.status === 504) {
    return 'The data service is waking up or unavailable, try again in a few seconds';
  }
  return 'Something went wrong, please try again';
}
