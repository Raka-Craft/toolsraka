// /api/ytinfo.js — Tools Raka: Info Video YouTube + tombol "Buka di YouTube"
// Ini PILIHAN Tuan sendiri (2026-10-20, via chat): "Info video + tombol buka YouTube".
// Download MP4 gratis diblokir YouTube-nya sendiri — jadi mode ini jujur: info + deep link.
// Engine: noembed.com (gratis, tanpa key). Dites & lolos 2026-10-20 ~20:30 WIB:
//   GET https://noembed.com/embed?url=<youtube_url>
//   -> {"title":"...","author_name":"...","thumbnail_url":"https://i.ytimg.com/...","url":"..."}

export default async function handler(req, res) {
  const url = (req.query.url || '').toString().trim();
  if (!url || !/youtu(\.be|be\.com)\//i.test(url)) {
    return res.status(400).json({ ok: false, error: 'Tempel link YouTube yang valid dulu ya, Tuan.' });
  }
  try {
    const r = await fetch('https://noembed.com/embed?url=' + encodeURIComponent(url), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10)' }
    });
    const j = await r.json();
    if (j.error || !j.title) {
      return res.status(502).json({ ok: false, error: 'Video-nya nggak kebaca. Coba link YouTube lain.' });
    }
    return res.status(200).json({
      ok: true,
      title: j.title,
      author: j.author_name || '',
      thumbnail: j.thumbnail_url || '',
      url: j.url || url
    });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Server-nya lagi sibuk. Coba lagi sebentar ya.' });
  }
}
