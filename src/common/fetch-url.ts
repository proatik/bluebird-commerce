import { isIP } from 'node:net';
import { BadRequestException, BadGatewayException, PayloadTooLargeException } from '@nestjs/common';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 2_000_000;

const PRIVATE_IPV4_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/
];

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();

  if (host === 'localhost') {
    return true;
  }

  const ipVersion = isIP(host);

  if (ipVersion === 4) {
    return PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(host));
  }

  if (ipVersion === 6) {
    return host === '::1' || host === '::' || host.startsWith('fe80:');
  }

  return false;
}

// literal-IP/hostname check only, not DNS-rebinding-proof — good enough to
// block an operator accidentally or maliciously targeting an internal address.
export function assertFetchable(url: string): void {
  const parsed = new URL(url);

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new BadRequestException(`Unsupported URL scheme '${parsed.protocol}'.`);
  }

  if (isPrivateHost(parsed.hostname)) {
    throw new BadRequestException(`Refusing to fetch a private/local address '${parsed.hostname}'.`);
  }
}

export async function fetchUrl(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

  if (!response.ok) {
    throw new BadGatewayException(`Fetching '${url}' failed with status ${response.status}.`);
  }

  if (!response.body) {
    return '';
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  for (;;) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    total += value.byteLength;

    if (total > MAX_RESPONSE_BYTES) {
      await reader.cancel();
      throw new PayloadTooLargeException(`Response from '${url}' exceeded ${MAX_RESPONSE_BYTES} bytes.`);
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks).toString('utf-8');
}
