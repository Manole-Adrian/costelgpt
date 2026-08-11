const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_OVERLAP = 120;

/**
 * Breaks text into the largest pieces that still fit in `size`, preferring
 * paragraph boundaries, then sentence boundaries, and only hard-cutting when
 * a single sentence is longer than a whole chunk.
 */
function splitIntoSegments(text: string, size: number) {
  const segments: string[] = [];

  for (const paragraph of text.split(/\n\s*\n/)) {
    const trimmedParagraph = paragraph.trim();
    if (!trimmedParagraph) continue;

    if (trimmedParagraph.length <= size) {
      segments.push(trimmedParagraph);
      continue;
    }

    for (const sentence of trimmedParagraph.split(/(?<=[.!?])\s+/)) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      if (trimmedSentence.length <= size) {
        segments.push(trimmedSentence);
        continue;
      }

      for (let i = 0; i < trimmedSentence.length; i += size) {
        segments.push(trimmedSentence.slice(i, i + size));
      }
    }
  }

  return segments;
}

/**
 * Packs segments into chunks, carrying the tail of each chunk into the next so
 * that a fact spanning a boundary still appears whole in one of them.
 */
export function chunkText(text: string, size = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP) {
  const segments = splitIntoSegments(text, size);
  const chunks: string[] = [];
  let current = "";

  for (const segment of segments) {
    if (current && current.length + segment.length + 1 > size) {
      chunks.push(current);

      // Only carry context over when the next segment leaves room for it,
      // so chunks never grow past `size`.
      const carried = overlap > 0 && segment.length + overlap <= size
        ? current.slice(-overlap)
        : "";
      current = carried ? `${carried}\n${segment}` : segment;
    } else {
      current = current ? `${current}\n${segment}` : segment;
    }
  }

  if (current) chunks.push(current);

  return chunks;
}
