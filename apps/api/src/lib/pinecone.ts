import { Pinecone } from '@pinecone-database/pinecone';
import { PINECONE_INDEX } from '@fount/shared/constants';

let _client: Pinecone | null = null;

export function getPinecone(): Pinecone {
  if (!_client) {
    _client = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  }
  return _client;
}

export function getIndex() {
  return getPinecone().index(PINECONE_INDEX);
}
