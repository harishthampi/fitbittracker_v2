import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser with 50mb limit for high-res photo uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve public files statically
app.use(express.static(path.resolve(__dirname, 'public')));

// Endpoint: Direct ZIP download with proper binary headers
app.get(['/api/download-zip', '/befittracker-project.zip'], (_req, res) => {
  const zipPath = path.resolve(__dirname, 'public', 'befittracker-project.zip');
  if (!fs.existsSync(zipPath)) {
    return res.status(404).json({ error: 'ZIP archive not found on server.' });
  }
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="befittracker-project.zip"');
  res.sendFile(zipPath);
});

// Shared server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// List of free-tier multimodal models in order of preference
const FALLBACK_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
];

// Endpoint: AI Meal Vision Analyzer (Multimodal) with Automatic Multi-Model Fallback
app.post('/api/analyze-meal', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', mealType = 'lunch' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image provided for meal analysis.' });
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const imagePart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };

    const promptText = `You are a certified sports nutritionist and precision culinary AI. 
Analyze this food photograph and estimate its nutritional breakdown with maximum realistic accuracy for a fitness tracker.

Identify:
1. The overall dish name.
2. Total calories (kcal).
3. Macronutrients in grams: Protein, Carbohydrates, and Fats.
4. Main ingredients and estimated portion sizes.
5. A brief 1-sentence nutritional tip for the athlete.

Return strictly valid JSON conforming to the schema.`;

    let lastError: any = null;
    let successfulData: any = null;
    let usedModelName = '';

    // Cascade through free-tier fallback models if one is under high demand (503/429)
    for (const modelName of FALLBACK_MODELS) {
      try {
        console.log(`[AI Meal Scanner] Attempting analysis with model: ${modelName}`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [imagePart, { text: promptText }],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                dishName: {
                  type: Type.STRING,
                  description: 'Clear, recognizable title of the meal or dish.',
                },
                calories: {
                  type: Type.INTEGER,
                  description: 'Estimated total calories in kcal.',
                },
                proteinGrams: {
                  type: Type.INTEGER,
                  description: 'Estimated protein in grams.',
                },
                carbsGrams: {
                  type: Type.INTEGER,
                  description: 'Estimated carbohydrates in grams.',
                },
                fatGrams: {
                  type: Type.INTEGER,
                  description: 'Estimated fat in grams.',
                },
                confidence: {
                  type: Type.STRING,
                  description: 'Estimation confidence: High, Medium, or Approximate.',
                },
                ingredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      portion: { type: Type.STRING },
                      calories: { type: Type.INTEGER },
                    },
                    required: ['name', 'portion'],
                  },
                },
                healthInsight: {
                  type: Type.STRING,
                  description: 'One sentence coaching tip about this meal for fitness.',
                },
              },
              required: ['dishName', 'calories', 'proteinGrams', 'carbsGrams', 'fatGrams'],
            },
          },
        });

        if (response.text) {
          successfulData = JSON.parse(response.text);
          usedModelName = modelName;
          console.log(`[AI Meal Scanner] Success using model: ${modelName}`);
          break; // successfully analyzed!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[AI Meal Scanner] Model ${modelName} failed (${err?.message || err}). Trying next fallback model...`);
      }
    }

    if (successfulData) {
      return res.json({
        success: true,
        mealType,
        modelUsed: usedModelName,
        data: successfulData,
      });
    }

    // If all models encountered temporary upstream server issues, extract user-friendly error message
    let friendlyMessage = 'AI analysis service is temporarily busy. Please try again in a few moments.';
    if (lastError?.message) {
      try {
        const parsed = JSON.parse(lastError.message);
        if (parsed.error?.message) {
          friendlyMessage = parsed.error.message;
        }
      } catch {
        friendlyMessage = lastError.message;
      }
    }

    return res.status(503).json({
      error: friendlyMessage,
    });
  } catch (error: any) {
    console.error('Error analyzing meal photo:', error);
    return res.status(500).json({
      error: error.message || 'Failed to analyze meal photograph. Please try again.',
    });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on 0.0.0.0:${PORT}`);
  });
}

startServer();
