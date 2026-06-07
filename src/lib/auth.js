import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'secret-yuki-roti-key-super-secure-for-enterprise';
const key = new TextEncoder().encode(secretKey);

export async function signJWT(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(key);
}

export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}
