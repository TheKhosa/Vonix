import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@deepgram/sdk';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Configuration
const DEEPGRAM_API_KEY = 'ae810975618519dc611743b81fadc8df193c5b25';
const OVH_API_KEY = 'eyJhbGciOiJFZERTQSIsImtpZCI6IjgzMkFGNUE5ODg3MzFCMDNGM0EzMTRFMDJFRUJFRjBGNDE5MUY0Q0YiLCJraW5kIjoicGF0IiwidHlwIjoiSldUIn0.eyJ0b2tlbiI6IjMvSXI5VGVxa3V3RUFONWxYTnVNZ1lFbzJ4TlhWbXFldUlnaTY5VGtJK0E9In0.nYb86rCOUTEBuYYz5PHY1ZmFG87qpDHXIOfAd0tx7NZEHDTGp1s7iD0EL6hnrgA_n6sQbhNEcwbp69zHXprxBA';
const WHISPER_ENDPOINT = 'https://whisper-large-v3.endpoints.kepler.ai.cloud.ovh.net';
const GPT_ENDPOINT = 'https://gpt-oss-120b.endpoints.kepler.ai.cloud.ovh.net';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Deepgram
const deepgram = createClient(DEEPGRAM_API_KEY);

// Conversation history for context
let conversationHistory = [];

/**
 * Endpoint: POST /transcribe
 * Transcribes audio using Whisper API
 */
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        console.log('Transcribing audio with Whisper...');

        // Create form data for Whisper API
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav'
        });

        // Call Whisper API
        const response = await fetch(`${WHISPER_ENDPOINT}/v1/audio/transcriptions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OVH_API_KEY}`,
                ...formData.getHeaders()
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Whisper API error:', errorText);
            throw new Error(`Whisper API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Transcription result:', data);

        res.json({ text: data.text || '' });
    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Endpoint: POST /chat
 * Gets AI response using GPT OSS API
 */
app.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'No message provided' });
        }

        console.log('Getting AI response for:', message);

        // Add user message to history
        conversationHistory.push({
            role: 'user',
            content: message
        });

        // Keep only last 10 messages for context
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
        }

        // Prepare messages with system prompt
        const messages = [
            {
                role: 'system',
                content: 'You are Vonix, a helpful and friendly AI voice assistant. Keep your responses concise and conversational, as they will be spoken aloud. Aim for responses under 3 sentences unless more detail is specifically requested.'
            },
            ...conversationHistory
        ];

        // Call GPT OSS API
        const response = await fetch(`${GPT_ENDPOINT}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OVH_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-oss-120b',
                messages: messages,
                max_tokens: 200,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GPT API error:', errorText);
            throw new Error(`GPT API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;

        // Add assistant response to history
        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });

        console.log('AI response:', assistantMessage);

        res.json({ response: assistantMessage });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Endpoint: POST /speak
 * Converts text to speech using Deepgram TTS
 */
app.post('/speak', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        console.log('Converting text to speech:', text);

        // Call Deepgram TTS API
        const response = await deepgram.speak.request(
            { text },
            {
                model: 'aura-2-thalia-en'
            }
        );

        const stream = await response.getStream();

        if (!stream) {
            throw new Error('Failed to get audio stream from Deepgram');
        }

        // Set headers for audio streaming
        res.setHeader('Content-Type', 'audio/mp3');

        // Collect all chunks
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }

        const audioBuffer = Buffer.concat(chunks);
        res.send(audioBuffer);

        console.log('Audio generated successfully');
    } catch (error) {
        console.error('TTS error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Endpoint: GET /
 * Serves the main HTML page
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Endpoint: POST /reset
 * Resets conversation history
 */
app.post('/reset', (req, res) => {
    conversationHistory = [];
    res.json({ success: true, message: 'Conversation history reset' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════╗
║         Vonix AI Assistant            ║
║     Voice-to-Voice AI Powered by      ║
║   Deepgram TTS + Whisper + GPT OSS    ║
╚═══════════════════════════════════════╝

🚀 Server running on http://localhost:${PORT}
🎤 Open your browser and start talking!

API Endpoints:
- POST /transcribe  - Transcribe audio to text
- POST /chat        - Get AI response
- POST /speak       - Convert text to speech
- POST /reset       - Reset conversation history
    `);
});
