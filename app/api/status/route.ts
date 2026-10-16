import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const provider = url.searchParams.get('provider');
  const taskId = url.searchParams.get('taskId');
  if (!taskId || !['runway', 'higgsfield'].includes(provider || '')) return NextResponse.json({ error: 'A valid provider and taskId are required.' }, { status: 400 });
  try {
    if (provider === 'runway') {
      const key = process.env.RUNWAY_API_KEY;
      if (!key) return NextResponse.json({ error: 'Runway is not configured.' }, { status: 503 });
      const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${encodeURIComponent(taskId)}`, { headers: { Authorization: `Bearer ${key}`, 'X-Runway-Version': '2024-11-06' }, cache: 'no-store' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return NextResponse.json({ error: data?.message || 'Could not fetch Runway task status.' }, { status: response.status });
      const status = String(data.status || 'PENDING');
      return NextResponse.json({ provider, taskId, status, videoUrl: data.output?.[0] || null, error: data.failure || data.failureCode || null });
    }
    const credentials = process.env.HF_CREDENTIALS || (process.env.HF_API_KEY_ID && process.env.HF_API_KEY_SECRET ? `${process.env.HF_API_KEY_ID}:${process.env.HF_API_KEY_SECRET}` : '');
    if (!credentials) return NextResponse.json({ error: 'Higgsfield is not configured.' }, { status: 503 });
    const response = await fetch(`https://api.higgsfield.ai/requests/${encodeURIComponent(taskId)}/status`, { headers: { Authorization: `Key ${credentials}` }, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: data?.message || 'Could not fetch Higgsfield task status.' }, { status: response.status });
    const status = String(data.status || data.state || 'PENDING').toUpperCase();
    const videoUrl = data.video?.url || data.video_url || data.output?.[0] || data.result?.video?.url || data.url || null;
    return NextResponse.json({ provider, taskId, status, videoUrl, error: data.error || data.message_error || null, rawStatus: data });
  } catch (error) {
    console.error('Video status check failed', error);
    return NextResponse.json({ error: 'Unable to check generation status.' }, { status: 500 });
  }
}
