import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const SECRET = import.meta.env.CSRF_SECRET ?? 'change-this-in-env';

export function generateToken(): string {
  const nonce = randomBytes(16).toString('hex');
  const hash = createHmac('sha256', SECRET).update(nonce).digest('hex');
  return `${nonce}.${hash}`;
}

export function validateToken(token: string): boolean {
  const [nonce, hash] = (token ?? '').split('.');
  if (!nonce || !hash) return false;
  const expected = createHmac('sha256', SECRET).update(nonce).digest('hex');
  try {
    return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}
