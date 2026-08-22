export type SparseVector = {
  indices: number[];
  values: number[];
};

function tokenize(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .match(/[a-z0-9]+/g) ?? [];
}

function tokenIndex(token: string): number {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index++) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSparseVector(text: string): SparseVector {
  const frequencies = new Map<number, number>();

  for (const token of tokenize(text)) {
    const index = tokenIndex(token);
    frequencies.set(index, (frequencies.get(index) ?? 0) + 1);
  }

  const entries = [...frequencies.entries()].sort(([left], [right]) => left - right);

  return {
    indices: entries.map(([index]) => index),
    values: entries.map(([, frequency]) => 1 + Math.log(frequency))
  };
}