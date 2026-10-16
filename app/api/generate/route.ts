import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const HIGGSFIELD_MODELS: Record<string, string> = {
  'kling-turbo': 'kling-video/v3.0-turbo/text-to-video',
  'wan-prime': 'alibaba/wan-3.0-prime/text-to-video',
};

function pickAutomaticModel(style: string, duration: number) {
  // Sensible starter routing rules; refine using real cost/quality benchmarks.
  if (style === '3D Animation' || style === 'Education') return 'wan-prime';
  if (duration > 15) return 'wan-prime';
  return 'kling-turbo';
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = String(body.prompt ?? '').trim();
    const style = String(body.style ?? 'Cinematic');
    const mode = body.mode === 'professional' ? 'professional' : 'automatic';
    const requestedProvider = body.provider === 'runway' ? 'runway' : 'higgsfield';
    const duration = Math.max(3, Math.min(30, Number(body.duration) || 5));
    const aspectRatio = ['16:9', '9:16', '1:1'].includes(body.aspectRatio) ? body.aspectRatio : '16:9';
    if (!prompt) return NextResponse.json({ error: 'Please enter a video prompt.' }, { status: 400 });

    if (requestedProvider === 'runway') {
      const key = process.env.RUNWAY_API_KEY;
      if (!key) return NextResponse.json({ error: 'Runway is not configured. Add RUNWAY_API_KEY to your server environment.' }, { status: 503 });
      const ratio = aspectRatio === '9:16' ? '720:1280' : aspectRatio === '1:1' ? '960:960' : '1280:720';
      const response = await fetch('https://api.dev.runwayml.com/v1/image_to_video', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Runway-Version': '2024-11-06' },
        body: JSON.stringify({ model: 'gen4.5', promptText: `${prompt}\nVisual style: ${style}.`, ratio, duration: Math.min(10, duration) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return NextResponse.json({ error: data?.error || data?.message || 'Runway request failed.', details: data }, { status: response.status });
      return NextResponse.json({ provider: 'runway', taskId: data.id, status: 'PENDING', note: 'Runway clip duration is limited to 10 seconds per generated shot in this starter integration.' });
    }

    const credentials = process.env.HF_CREDENTIALS || (process.env.HF_API_KEY_ID && process.env.HF_API_KEY_SECRET ? `${process.env.HF_API_KEY_ID}:${process.env.HF_API_KEY_SECRET}` : '');
    if (!credentials) return NextResponse.json({ error: 'Higgsfield is not configured. Add HF_CREDENTIALS or HF_API_KEY_ID and HF_API_KEY_SECRET to your server environment.' }, { status: 503 });
    const chosen = mode === 'automatic' ? pickAutomaticModel(style, duration) : (HIGGSFIELD_MODELS[String(body.model)] ? String(body.model) : 'kling-turbo');
    const modelId = HIGGSFIELD_MODELS[chosen];
    const isWan = chosen === 'wan-prime';
    const apiBody = isWan
      ? { prompt: `${prompt}\nVisual style: ${style}.`, duration: Math.min(30, Math.max(2, duration)), resolution: '720p', aspect_ratio: aspectRatio, generate_audio: Boolean(body.generateAudio) }
      : { prompt: `${prompt}\nVisual style: ${style}.`, duration: Math.min(15, Math.max(3, duration)), resolution: '720p', aspect_ratio: aspectRatio, sound: Boolean(body.generateAudio) ? 'on' : 'off' };
    const response = await fetch(`https://api.higgsfield.ai/${modelId}`, {
      method: 'POST',
      headers: { Authorization: `Key ${credentials}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(apiBody),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: data?.message || data?.error || 'Higgsfield request failed.', details: data }, { status: response.status });
    const taskId = data.request_id || data.id || data.requestId;
    if (!taskId) return NextResponse.json({ error: 'Provider accepted an unexpected response. Check server logs/provider response.', details: data }, { status: 502 });
    return NextResponse.json({ provider: 'higgsfield', taskId, model: chosen, status: 'PENDING', note: isWan && duration > 15 ? 'Using Wan 3.0 Prime for the longer requested clip.' : undefined });
  } catch (error) {
    console.error('Video generation request failed', error);
    return NextResponse.json({ error: 'Unable to start generation. Check server configuration and try again.' }, { status: 500 });
  }
}
