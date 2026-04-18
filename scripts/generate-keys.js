#!/usr/bin/env node
/**
 * Generates an RSA-2048 key pair for JWT RS256 signing.
 * Run:  node scripts/generate-keys.js
 * Copy the output values into your .env file.
 */
import { generateKeyPairSync } from 'crypto';

const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const toBase64 = (pem) => Buffer.from(pem).toString('base64');

console.log('\n=== JWT RSA Key Pair ===\n');
console.log(`JWT_PRIVATE_KEY_BASE64=${toBase64(privateKey)}`);
console.log(`JWT_PUBLIC_KEY_BASE64=${toBase64(publicKey)}`);
console.log('\nCopy the above two lines into your services/identity-service/.env\n');
