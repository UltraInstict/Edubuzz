import { createHash, randomBytes } from 'crypto';

const SECRET = import.meta.env.CSRF_SECRET ?? 'change-this-in-env';

export function generateToken(): string {
  const nonce = randomBytes(16).toString('hex');
  const hash = createHash('sha256').update(nonce + SECRET).digest('hex');
  return `${nonce}.${hash}`;
}

export function validateToken(token: string): boolean {
  const [nonce, hash] = (token ?? '').split('.');
  if (!nonce || !hash) return false;
  const expected = createHash('sha256').update(nonce + SECRET).digest('hex');
  return hash === expected;
}
