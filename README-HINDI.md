# YouTube Notes Generator — Mobile + Laptop

## सबसे आसान online deployment
यह project Render जैसे Node.js hosting पर deploy किया जा सकता है।

1. इस पूरे folder को GitHub repository में upload करें।
2. Render में New Web Service चुनें और GitHub repo connect करें।
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment Variables में:
   - `OPENAI_API_KEY` = आपकी OpenAI API key
   - `OPENAI_MODEL` = आपके account में उपलब्ध model (default `gpt-5`)
6. Deploy करें।
7. मिले हुए URL को mobile/laptop दोनों में खोलें।

## महत्वपूर्ण
- API key browser code में नहीं डालनी है।
- Notes transcript/captions पर आधारित हैं। जिस video में accessible transcript नहीं है, उस पर यह version notes नहीं बना पाएगा।
- PDFKit का default Helvetica font Hindi/Devanagari को सही तरह embed नहीं करता। Production में Hindi PDF के लिए Devanagari TTF font (जैसे Noto Sans Devanagari) server में जोड़ना बेहतर है। English/Hinglish के लिए यह version ठीक है।
