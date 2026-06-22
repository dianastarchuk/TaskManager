const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RequestOptions extends RequestInit {
  token?: string;
}

/**
 * Pomocnicza funkcja do wykonywania zapytań HTTP do backendu.
 * Automatycznie dołącza nagłówek Content-Type oraz token autoryzacyjny JWT (Bearer)
 * z localStorage, jeśli użytkownik jest zalogowany. Obsługuje również parsowanie
 * ewentualnych błędów zwracanych przez serwer.
 * 
 * @param endpoint Relatywna ścieżka do API (np. '/auth/login').
 * @param options Dodatkowe opcje zapytania fetch (metoda, body itp.).
 */
export async function apiFetch(endpoint: string, options: RequestOptions = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.message)) {
        errorMessage = errorData.message.join(', ');
      } else {
        errorMessage = errorData.message || errorMessage;
      }
    } catch {
      // Ignored
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
