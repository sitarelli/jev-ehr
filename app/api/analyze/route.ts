import { NextRequest, NextResponse } from 'next/server';
import { EHR_QUESTIONS } from './jev-questions';

export async function POST(req: NextRequest) {
  const { diary } = await req.json();
  if (!diary || diary.trim().length < 3) {
    return NextResponse.json({ error: 'Diario vuoto' }, { status: 400 });
  }
  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Manca AI_GATEWAY_API_KEY - vai in Vercel > Settings > Environment Variables' }, { status: 500 });
  }
  const start = Date.now();
  try {
    const resp = await fetch('https://ai-gateway.vercel.sh/v1/evaluate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'typesafe-ai/jev',
        state: diary,
        questions: EHR_QUESTIONS,
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json({ error: `Gateway ${resp.status}`, details: txt }, { status: resp.status });
    }
    const data = await resp.json();
    const latency = Date.now() - start;
    return NextResponse.json({ latency, model: 'typesafe-ai/jev via Vercel AI Gateway', raw: data, extracted: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Errore chiamata Jev' }, { status: 500 });
  }
}
