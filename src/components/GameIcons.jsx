// Iconos pixel-art de cada juego (SVG inline, sin dependencias).
const ICONS = {
  'tres-en-raya': () => (
    <svg viewBox="0 0 12 12" aria-hidden="true"><g fill="#2a1850"><rect x="4" width="1" height="12"/><rect x="8" width="1" height="12"/><rect y="4" width="12" height="1"/><rect y="8" width="12" height="1"/></g><g fill="#ff4fa3"><rect x="0" y="0" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/><rect x="1" y="1" width="2" height="2" opacity="0"/><rect x="1" y="1" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="2" y="0" width="1" height="1"/><rect x="0" y="2" width="1" height="1"/></g><g fill="#2ea8ff"><rect x="5" y="5" width="3" height="3" opacity="0"/><rect x="5" y="5" width="1" height="1"/><rect x="6" y="5" width="2" height="1"/><rect x="5" y="6" width="1" height="2"/><rect x="7" y="6" width="1" height="2"/><rect x="6" y="7" width="1" height="1" opacity="0"/><rect x="6" y="7" width="1" height="1"/></g><g fill="#ffd23f"><rect x="9" y="0" width="1" height="1"/><rect x="11" y="0" width="1" height="1"/><rect x="10" y="1" width="1" height="1"/><rect x="9" y="2" width="1" height="1"/><rect x="11" y="2" width="1" height="1"/></g></svg>
  ),
  'culebrita': () => (
    <svg viewBox="0 0 12 12" aria-hidden="true"><g fill="#47ff9a"><rect x="1" y="9" width="5" height="1"/><rect x="6" y="5" width="1" height="5"/><rect x="6" y="5" width="4" height="1"/><rect x="10" y="3" width="1" height="3"/></g><rect x="10" y="2" width="1" height="1" fill="#fff"/><rect x="2" y="3" width="2" height="2" fill="#ff4fa3"/></svg>
  ),
  'turbo-bit': () => (
    <svg viewBox="0 0 12 12" aria-hidden="true"><g fill="#2a1850"><rect x="2" y="0" width="1" height="12"/><rect x="9" y="0" width="1" height="12"/></g><g fill="#ffd23f"><rect x="5.5" y="0" width="1" height="2"/><rect x="5.5" y="4" width="1" height="2"/><rect x="5.5" y="8" width="1" height="2"/></g><g fill="#ff4fa3"><rect x="4" y="6" width="4" height="5"/></g><g fill="#2ea8ff"><rect x="5" y="7" width="2" height="2"/></g><g fill="#fff"><rect x="3.5" y="6.5" width="1" height="1.5"/><rect x="7.5" y="6.5" width="1" height="1.5"/><rect x="3.5" y="9.5" width="1" height="1.5"/><rect x="7.5" y="9.5" width="1" height="1.5"/></g></svg>
  ),
};

export default function GameIcon({ slug }) {
  const Icon = ICONS[slug];
  return Icon ? <Icon /> : null;
}
