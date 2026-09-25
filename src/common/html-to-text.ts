const MAX_EXTRACTION_CHARS = 15_000;

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&nbsp;': ' '
};

function decodeEntities(text: string): string {
  return text.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (match) => ENTITIES[match] ?? match);
}

// lossy noise reduction for the model's benefit, not accurate DOM parsing —
// truncation is applied after stripping so boilerplate doesn't eat the budget.
export function htmlToText(html: string): string {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  const withoutStyles = withoutScripts.replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const withoutComments = withoutStyles.replace(/<!--[\s\S]*?-->/g, ' ');
  const withoutTags = withoutComments.replace(/<[^>]+>/g, ' ');
  const decoded = decodeEntities(withoutTags);
  const collapsed = decoded.replace(/\s+/g, ' ').trim();

  return collapsed.slice(0, MAX_EXTRACTION_CHARS);
}
