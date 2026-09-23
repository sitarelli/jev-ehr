import { NextRequest, NextResponse } from 'next/server';
import { EHR_QUESTIONS } from '@/lib/jev-questions';

export async function POST(req: NextRequest) {
  const { diary } = await req.json();
  if (!diary || diary.trim().length < 3) {
    return NextResponse.json({ error: 'Diario vuoto' }, { status: 400 });
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Manca AI_GATEWAY_API_KEY nel .env.local' }, { status: 500 });
  }

  const start = Date.now();

  // Chiamata reale a Vercel AI Gateway -> Jev
  // Docs: https://vercel.com/docs/ai-gateway
  // Model ID: typesafe-ai/jev
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
      // Fallback: se endpoint cambia, prova il secondo endpoint documentato
      // Alcuni SDK usano /typesafe
      console.error('Gateway error', resp.status, txt);
      return NextResponse.json({ 
        error: `Gateway ${resp.status}`, 
        details: txt,
        hint: "Verifica che la chiave vck_ sia attiva in Vercel > AI Gateway. Se errore 404, prova a aggiornare il modello su Vercel dashboard."
      }, { status: resp.status });
    }

    const data = await resp.json();
    const latency = Date.now() - start;

    // data contiene le decisioni tipizzate { value, confidence, distribution? }
    return NextResponse.json({
      latency,
      model: 'typesafe-ai/jev via Vercel AI Gateway',
      raw: data,
      // Normalizziamo per UI
      extracted: data,
    });

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || 'Errore chiamata Jev' }, { status: 500 });
  }
}
