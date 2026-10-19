import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini AI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// Fallback smart script optimizer if API key is not configured or in offline mode
function localRadioScriptPolisher(
  script: string,
  targetDurationSec: number = 45,
  tone: string = 'energetic',
  language: string = 'sw'
): string {
  let cleaned = script.trim();
  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Word count & pacing calculation (~130 words per min = ~2.16 words per sec)
  const targetWords = Math.round((targetDurationSec / 60) * 130);

  if (language === 'sw') {
    // Add professional broadcast cues
    if (!cleaned.startsWith('"') && !cleaned.startsWith('Wasikilizaji')) {
      cleaned = `Wasikilizaji wa Radio Kwizera 97.7 FM, ${cleaned}`;
    }
    if (!cleaned.includes('[Paza Sauti]') && tone === 'energetic') {
      cleaned = cleaned.replace(/(Piga simu|Wasiliana nasi|Fika sasa)/i, '[Paza Sauti na Msisitizo: $1]');
    }
  } else {
    if (!cleaned.startsWith('Listeners') && !cleaned.startsWith('Tune in')) {
      cleaned = `Radio Kwizera 97.7 FM listeners, ${cleaned}`;
    }
  }

  return cleaned;
}

// API Route: AI Mention Rewriter
app.post('/api/rewrite-mention', async (req, res) => {
  try {
    const { script, clientName, category, durationSec, tone, language } = req.body;

    if (!script || typeof script !== 'string') {
      return res.status(400).json({ error: 'Script text is required' });
    }

    const ai = getGenAI();
    const duration = Number(durationSec) || 45;
    const targetWordCount = Math.round((duration / 60) * 130); // ~130 words per min

    if (ai) {
      const prompt = `You are the Head of Commercial Radio Production and Lead Copywriter at Radio Kwizera 97.7 FM (Slogan: "Jukwaa la Matumaini"), broadcasting to Kagera, Ngara, Bukoba, Kigoma, Rwanda, and Burundi.
Rewrite and optimize the following commercial script for on-air radio broadcast:

CLIENT NAME: "${clientName || 'Commercial Advertiser'}"
CATEGORY: "${category || 'General Commercial'}"
TARGET BROADCAST DURATION: ${duration} seconds (Approximately ${targetWordCount} words).
TONE: ${tone || 'Warm, energetic, trustworthy, authoritative'}
TARGET LANGUAGE: ${language === 'en' ? 'English' : 'Swahili (Kiswahili Sanifu with catchy regional appeal)'}

RAW DRAFT SCRIPT:
"""${script}"""

INSTRUCTIONS:
1. Polish grammar, flow, rhythm, and natural spoken radio cadence.
2. Ensure the station name "Radio Kwizera 97.7 FM" and slogan "Jukwaa la Matumaini" are woven in gracefully if appropriate.
3. Add explicit presenter audio cues in square brackets (e.g. [Paza Sauti], [Pumzika sekunde 1], [Sisitiza Namba ya Simu]).
4. Maintain exact call to actions (phone numbers, locations, discount codes).
5. Strictly stay within approximately ${targetWordCount} words so it fits the ${duration}-second slot comfortably.
6. Return ONLY the finalized ready-to-read script text without any introductory conversational markdown.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const rewritten = response.text?.trim() || localRadioScriptPolisher(script, duration, tone, language);
      return res.json({
        rewrittenScript: rewritten,
        provider: 'gemini-3.8-flash',
        wordCount: rewritten.split(/\s+/).length,
      });
    }

    // Fallback if no GEMINI_API_KEY
    const polished = localRadioScriptPolisher(script, duration, tone, language);
    return res.json({
      rewrittenScript: polished,
      provider: 'local-radio-engine',
      wordCount: polished.split(/\s+/).length,
    });
  } catch (err: any) {
    console.error('Gemini rewrite error:', err);
    // Graceful fallback to local engine
    const polished = localRadioScriptPolisher(req.body.script || '', req.body.durationSec || 45, req.body.tone, req.body.language);
    return res.json({
      rewrittenScript: polished,
      provider: 'local-radio-engine-fallback',
      wordCount: polished.split(/\s+/).length,
      note: 'Processed via local radio copy editor (Gemini fallback)',
    });
  }
});

// API Route: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    station: 'Radio Kwizera 97.7 FM',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Radio Kwizera Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
