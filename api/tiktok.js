// /api/tiktok.js — Tools Raka: TikTok Downloader (gratis, tanpa API key)
// Engine: TikWM public API. Dites & lolos 2026-10-20 ~20:30 WIB dengan video TikTok asli:
//   GET https://www.tikwm.com/api/?url=<link> -> {"code":0,"msg":"success","processed_time":0.47,
//   "data":{"play":"<mp4 TANPA watermark>","wmplay":"<mp4 watermark>","music":"<audio>",
//   "cover":"<thumbnail>","title":"...","duration":29,"author":{"nickname":"..."}}}
// Catatan: TIDAK stream video lewat function ini — response serverless Vercel free kena
// batas ukuran, jadi tombol download pakai redirect 302 (go=1) ke URL CDN TikTok langsung.

export default async function handler(req, res) {
  const url = (req.query.url || '').toString().trim();
  if (!url || !/tiktok\.com\//i.test(url)) {
    return res.status(400).json({ ok: false, error: 'Tempel link TikTok yang valid dulu ya, Tuan.' });
  }
  try {
    const r = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(url), {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10)' }
    });
    const j = await r.json();
    if (j.code !== 0 || !j.data || !j.data.play) {
      return res.status(502).json({ ok: false, error: 'Link-nya nggak kebaca. Coba link video TikTok lain.' });
    }
    const d = j.data;
    // go=1 -> redirect 302 ke file MP4 (tanpa watermark). Browser HP: tap tombol,
    // video kebuka -> tap titik tiga -> download. go=2 -> versi watermark, go=3 -> audio.
    const go = req.query.go;
    if (go === '1') { res.writeHead(302, { Location: d.play }); return res.end(); }
    if (go === '2') { res.writeHead(302, { Location: d.wmplay }); return res.end(); }
    if (go === '3') { res.writeHead(302, { Location: d.music }); return res.end(); }
    return res.status(200).json({
      ok: true,
      title: d.title || 'Video TikTok',
      author: (d.author && d.author.nickname) || '',
      cover: d.cover || '',
      duration: d.duration || 0,
      size: d.size || 0,
      base: '/api/tiktok?url=' + encodeURIComponent(url)
    });
  } catch (e) {
    return res.status(502).json({ ok: false, error: 'Server-nya lagi sibuk. Coba lagi sebentar ya.' });
  }
}
