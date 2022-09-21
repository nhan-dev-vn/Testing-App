export function stripHTMLTags(html) {
  return html.replace(/<[^>]+>/gm, ' ')
      .replace(/&nbsp;/gm, ' ')
      .replace(/&lt;/gm, '<')
      .replace(/&gt;/gm, '>')
      .replace(/&amp;/gm, '&')
      .replace(/&quot;/gm, '"')
      .replace(/&apos;/gm, '\'');
}