type Token = string;

type AuthError = string;

type Result<T, E> = { ok: true, value: T } | { ok: false, error: E };