// Plain-English explanations for HTTP errors that come without a message of their own
// (nginx error pages, a crashed or restarting chat server, a dropped connection).
window.httpError = (status) => ({
  400: 'Invalid request (400) – the page sent something unexpected. Reload the page.',
  401: 'Not logged in (401).',
  403: 'Access denied (403) – code wrong or expired.',
  404: 'Endpoint not found (404) – the server does not know this function, the page is probably outdated. Reload.',
  408: 'Timed out while sending (408) – connection too slow.',
  410: 'Job no longer exists (410) – the server restarted or it took too long. Please start again.',
  413: 'Too large for the server (413) – make the file or text smaller.',
  429: 'Too many requests (429) – limit reached, try again later.',
  500: 'Internal server error (500) – the server hit a program error.',
  502: 'Server program is not running right now (502) – it is restarting or crashed. Try again in a minute.',
  503: 'Service temporarily unavailable (503) – overloaded or under maintenance.',
  504: 'Server did not answer in time (504 timeout) – the AI took too long.',
}[status] || `Unexpected response from the server (HTTP ${status}).`);
window.NET_ERROR = 'No connection to the server – internet down, server off or connection dropped.';
