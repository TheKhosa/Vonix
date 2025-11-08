# Vonix AI Assistant

A sleek, modern voice-to-voice AI assistant powered by cutting-edge AI models.

## Features

- 🎤 **Voice Input** - Speak naturally to the AI assistant
- 🧠 **GPT OSS 120B** - Powered by OVH's large language model
- 🗣️ **Natural Speech** - High-quality text-to-speech with Deepgram Aura
- 👂 **Whisper STT** - Accurate speech-to-text transcription
- 💬 **Conversation History** - Maintains context across the conversation
- 🎨 **Modern UI** - Beautiful, responsive interface with smooth animations

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express
- **APIs**:
  - Deepgram TTS (Aura 2 Thalia)
  - Whisper Large V3 (OVH)
  - GPT OSS 120B (OVH)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Microphone access in your browser

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Vonix
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Usage

1. **Click the microphone button** or **press and hold the spacebar** to start recording
2. **Speak your message** clearly into your microphone
3. **Click again** or **release the spacebar** to stop recording
4. Wait for the AI to:
   - Transcribe your speech
   - Generate a response
   - Speak the response back to you
5. Continue the conversation naturally!

## API Endpoints

- `POST /transcribe` - Transcribe audio to text using Whisper
- `POST /chat` - Get AI response using GPT OSS
- `POST /speak` - Convert text to speech using Deepgram
- `POST /reset` - Reset conversation history

## Configuration

The application uses the following API keys (configured in `server.js`):

- **Deepgram API Key**: For text-to-speech generation
- **OVH API Key**: For Whisper transcription and GPT OSS chat completions

## Project Structure

```
Vonix/
├── public/
│   └── index.html          # Frontend UI
├── server.js               # Backend server
├── package.json            # Dependencies
└── README.md              # This file
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires HTTPS for microphone access)

## Troubleshooting

**Microphone not working:**
- Ensure you've granted microphone permissions in your browser
- Check that your microphone is properly connected
- Try refreshing the page

**API errors:**
- Check the server console for detailed error messages
- Verify API keys are correct
- Ensure you have internet connectivity

**Audio not playing:**
- Check your browser's audio settings
- Ensure your volume is not muted
- Try using headphones

## Development

To run in development mode:
```bash
npm run dev
```

## License

MIT

## Credits

Built with:
- [Deepgram](https://deepgram.com/) - Text-to-Speech
- [OVH AI Endpoints](https://www.ovhcloud.com/) - Whisper STT & GPT OSS
- [Express](https://expressjs.com/) - Web framework
- Love and creativity ❤️

---

**Enjoy talking to Vonix!** 🎤✨
