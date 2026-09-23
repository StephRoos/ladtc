// POC extraction des posts du groupe Facebook privé LADTC (option A, Playwright CLI).
// Sélecteurs validés le 2026-09-23 sur le post 1986604415214195. Fragile : à re-vérifier
// si Facebook change le DOM (repli Apify, plan section 7).
// Sortie attendue : JSON normalisé pour scripts/import-social-posts.ts (Phase 1).

export interface ExtractedPost {
  externalId: string;
  authorName: string | null;
  content: string;
  mediaUrls: string[];
  permalink: string;
  postedAt: string | null;
}

const GROUP_ID = "1355264578348185";
const ACTIONS_LABEL = "Actions pour cette publication de";
const CONTAINER_DEPTH = 4;

export { GROUP_ID };

// Expand "En voir plus" buttons before extracting (full texts are truncated).
export const EXPAND_SNIPPET = `
(async () => {
  const btns = Array.from(document.querySelectorAll('button')).filter(b =>
    b.textContent.trim() === 'En voir plus');
  for (const b of btns) { b.click(); await new Promise(r => setTimeout(r, 300)); }
  return btns.length;
})()
`;

export const EXTRACT_SNIPPET = `
(() => {
  const btn = Array.from(document.querySelectorAll('[aria-label]'))
    .find(e => (e.getAttribute('aria-label') || '').includes('${ACTIONS_LABEL}'));
  if (!btn) return null;
  let el = btn.parentElement;
  for (let i = 0; i < ${CONTAINER_DEPTH}; i++) el = el.parentElement;
  const perm = el.querySelector('a[href*="/posts/"]');
  const m = perm && perm.href.match(/posts\\/(\\d+)/);
  const author = (btn.getAttribute('aria-label') || '').replace('${ACTIONS_LABEL} ', '');
  const dateLink = Array.from(el.querySelectorAll('a')).find(a => a.href.includes('%2CO%2CP-R'));
  let dateText = null;
  const dateSpan = dateLink && dateLink.querySelector('span[aria-labelledby]');
  if (dateSpan) {
    const ref = dateSpan.getAttribute('aria-labelledby');
    dateText = Array.from(document.querySelectorAll('[id]'))
      .filter(n => ref && ref.split(' ').includes(n.id))
      .map(n => n.textContent)[0] || null;
  }
  const imgs = Array.from(el.querySelectorAll('img'))
    .map(i => i.src).filter(s => s.includes('scontent'));
  const text = (el.innerText || '')
    .replace(/Facebook\\n?/g, '')
    .replace(/Indicateur de statut\\n?En\\n?ligne\\n?/g, '')
    .trim();
  return {
    externalId: m ? m[1] : null,
    authorName: author || null,
    content: text,
    mediaUrls: imgs,
    permalink: perm ? perm.href.split('?')[0] : null,
    postedAt: dateText,
  };
})()
`;
