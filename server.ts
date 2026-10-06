import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface LostReportPayload {
  id: string;
  title: string;
  category: string;
  description: string;
  color: string;
  brand: string;
  model?: string;
  distinguishingCharacteristics?: string;
  locationLost: string;
  dateLost: string;
  photoUrl?: string;
}

interface FoundItemPayload {
  id: string;
  title: string;
  category: string;
  generalDescription: string;
  color: string;
  brand: string;
  model?: string;
  publicCharacteristics?: string;
  locationFound: string;
  dateFound: string;
  photoUrl?: string;
  verificationQuestion?: string;
}

interface MatchResultItem {
  foundItemId: string;
  visualSimilarity: number;
  textSimilarity: number;
  locationSimilarity: number;
  timeSimilarity: number;
  overallScore: number;
  confidenceLabel: string;
  explanationSummary: string;
  reasons: string[];
  verificationPrompt: string;
}

function computeDeterministicFallbackMatch(
  lost: LostReportPayload,
  foundItems: FoundItemPayload[]
): MatchResultItem[] {
  const results: MatchResultItem[] = [];

  for (const item of foundItems) {
    let textSim = 30;
    let visualSim = 40;
    let locSim = 35;
    let timeSim = 70;
    const reasons: string[] = [];

    const lostCat = (lost.category || '').toLowerCase();
    const foundCat = (item.category || '').toLowerCase();
    if (lostCat && foundCat && lostCat === foundCat) {
      textSim += 25;
      visualSim += 25;
      reasons.push(`Same object category (${item.category})`);
    }

    const lostColor = (lost.color || '').toLowerCase();
    const foundColor = (item.color || '').toLowerCase();
    if (
      lostColor &&
      foundColor &&
      (lostColor.includes(foundColor) || foundColor.includes(lostColor))
    ) {
      visualSim += 22;
      reasons.push(`Matching ${item.color.toLowerCase()} color profile`);
    }

    const lostBrand = (lost.brand || '').toLowerCase().trim();
    const foundBrand = (item.brand || '').toLowerCase().trim();
    if (
      lostBrand &&
      foundBrand &&
      lostBrand !== 'not sure' &&
      (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand))
    ) {
      textSim += 28;
      visualSim += 10;
      reasons.push(`Same brand (${item.brand})`);
    }

    const lostLoc = (lost.locationLost || '').toLowerCase();
    const foundLoc = (item.locationFound || '').toLowerCase();
    if (lostLoc && foundLoc) {
      if (lostLoc === foundLoc || foundLoc.includes(lostLoc) || lostLoc.includes(foundLoc)) {
        locSim = 94;
        reasons.push(`Found in or near ${item.locationFound}`);
      } else if (lostLoc === 'not sure') {
        locSim = 65;
      } else {
        locSim = 45;
      }
    }

    const lostTokens = `${lost.title} ${lost.description} ${lost.distinguishingCharacteristics || ''}`
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3);
    const foundBlob = `${item.title} ${item.generalDescription} ${item.publicCharacteristics || ''}`.toLowerCase();

    let overlapCount = 0;
    for (const token of lostTokens) {
      if (foundBlob.includes(token)) {
        overlapCount++;
      }
    }
    if (overlapCount > 0) {
      textSim = Math.min(96, textSim + overlapCount * 9);
      reasons.push('Similar physical description and characteristics');
    }

    visualSim = Math.min(96, visualSim);
    textSim = Math.min(96, textSim);

    const overallScore = Math.round(
      visualSim * 0.35 + textSim * 0.35 + locSim * 0.18 + timeSim * 0.12
    );

    if (overallScore >= 42) {
      const confidenceLabel =
        overallScore >= 80
          ? 'Strong possible match'
          : overallScore >= 65
          ? 'Likely match'
          : 'Possible match';

      if (reasons.length === 0) {
        reasons.push('Comparable item type and timeframe on campus');
      }

      results.push({
        foundItemId: item.id,
        visualSimilarity: visualSim,
        textSimilarity: textSim,
        locationSimilarity: locSim,
        timeSimilarity: timeSim,
        overallScore,
        confidenceLabel,
        explanationSummary: `${confidenceLabel} because the item shares ${reasons
          .slice(0, 2)
          .join(' and ')
          .toLowerCase()}.`,
        reasons: reasons.slice(0, 5),
        verificationPrompt:
          item.verificationQuestion ||
          'Can you describe any unique marks, contents, lock-screen details, or wear patterns not visible in the summary?',
      });
    }
  }

  return results.sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '6mb' }));

  app.post('/api/ai/match-lost-report', async (req, res) => {
    const { lostReport, foundItems } = req.body as {
      lostReport: LostReportPayload;
      foundItems: FoundItemPayload[];
    };

    if (!lostReport || !Array.isArray(foundItems)) {
      return res.status(400).json({ error: 'Invalid request payload' });
    }

    if (foundItems.length === 0) {
      return res.json({ matches: [] });
    }

    try {
      const sanitizedFoundCatalog = foundItems.map((f) => ({
        id: f.id,
        title: f.title,
        category: f.category,
        generalDescription: f.generalDescription,
        color: f.color,
        brand: f.brand,
        model: f.model || '',
        publicCharacteristics: f.publicCharacteristics || '',
        locationFound: f.locationFound,
        dateFound: f.dateFound,
        verificationQuestion: f.verificationQuestion || '',
      }));

      const promptParts: any[] = [];

      if (
        lostReport.photoUrl &&
        lostReport.photoUrl.startsWith('data:image/')
      ) {
        const commaIdx = lostReport.photoUrl.indexOf(',');
        const header = lostReport.photoUrl.slice(0, commaIdx);
        const base64Data = lostReport.photoUrl.slice(commaIdx + 1);
        const mimeMatch = header.match(/data:(.*?);base64/);
        if (base64Data && mimeMatch) {
          promptParts.push({
            inlineData: {
              mimeType: mimeMatch[1],
              data: base64Data,
            },
          });
        }
      }

      promptParts.push({
        text: `You are the AI matching engine for the ESI Lost & Found Office on a university campus.
Compare the student's LOST ITEM REPORT against the FOUND ITEMS CATALOG stored at the Lost & Found Office.

Evaluate:
1. Visual similarity (shape, color, material, object type, visible markings)
2. Semantic/textual similarity (brand, model, description, distinguishing features)
3. Contextual similarity (campus location proximity, date/time proximity)

IMPORTANT ANTI-FRAUD & HUMILITY RULES:
- Never claim an item is definitely the student's item. Use labels strictly from: "Strong possible match", "Likely match", or "Possible match".
- Provide 3 to 5 clear, human-friendly reasons (e.g., "Same brand (Nike)", "Same matte black color", "Found near the Library", "Red keychain mentioned in report").
- Return only items with overallScore >= 45, sorted highest score first (max 5 items).
- Scores (visualSimilarity, textSimilarity, locationSimilarity, timeSimilarity, overallScore) must be integers from 0 to 100.

STUDENT LOST REPORT:
${JSON.stringify(
  {
    title: lostReport.title,
    category: lostReport.category,
    description: lostReport.description,
    color: lostReport.color,
    brand: lostReport.brand,
    model: lostReport.model,
    distinguishingCharacteristics: lostReport.distinguishingCharacteristics,
    locationLost: lostReport.locationLost,
    dateLost: lostReport.dateLost,
  },
  null,
  2
)}

FOUND ITEMS AT OFFICE:
${JSON.stringify(sanitizedFoundCatalog, null, 2)}`,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: { parts: promptParts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                foundItemId: { type: Type.STRING },
                visualSimilarity: { type: Type.INTEGER },
                textSimilarity: { type: Type.INTEGER },
                locationSimilarity: { type: Type.INTEGER },
                timeSimilarity: { type: Type.INTEGER },
                overallScore: { type: Type.INTEGER },
                confidenceLabel: { type: Type.STRING },
                explanationSummary: { type: Type.STRING },
                reasons: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                verificationPrompt: { type: Type.STRING },
              },
              required: [
                'foundItemId',
                'visualSimilarity',
                'textSimilarity',
                'locationSimilarity',
                'timeSimilarity',
                'overallScore',
                'confidenceLabel',
                'explanationSummary',
                'reasons',
                'verificationPrompt',
              ],
            },
          },
        },
      });

      const rawText = response.text?.trim() || '[]';
      const parsed = JSON.parse(rawText) as MatchResultItem[];
      const validIds = new Set(foundItems.map((f) => f.id));
      const filtered = parsed
        .filter((m) => validIds.has(m.foundItemId))
        .map((m) => ({
          ...m,
          overallScore: Math.max(0, Math.min(99, Math.round(m.overallScore))),
          reasons: (m.reasons || []).slice(0, 5).map((r) => String(r).slice(0, 180)),
          explanationSummary: String(m.explanationSummary || '').slice(0, 550),
          confidenceLabel: String(m.confidenceLabel || 'Possible match').slice(0, 75),
          verificationPrompt: String(
            m.verificationPrompt ||
              'Please describe a unique detail or hidden characteristic to verify ownership.'
          ).slice(0, 280),
        }))
        .sort((a, b) => b.overallScore - a.overallScore);

      if (filtered.length > 0) {
        return res.json({ matches: filtered });
      }

      const fallback = computeDeterministicFallbackMatch(lostReport, foundItems);
      return res.json({ matches: fallback });
    } catch (error) {
      console.error('AI matching fallback triggered:', error);
      const fallback = computeDeterministicFallbackMatch(lostReport, foundItems);
      return res.json({ matches: fallback });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ESI Lost & Found server listening on http://localhost:${PORT}`);
  });
}

startServer();
