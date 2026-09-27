import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import PDFDocument from "pdfkit";
import { YoutubeTranscript } from "youtube-transcript";

dotenv.config();
const app = express();
app.use(express.json({limit:"2mb"}));
app.use(express.static("public"));

const port = process.env.PORT || 3000;
const model = process.env.OPENAI_MODEL || "gpt-5";
const client = process.env.OPENAI_API_KEY ? new OpenAI({apiKey: process.env.OPENAI_API_KEY}) : null;

function getVideoId(raw) {
  try {
    const u = new URL(raw);
    if (u.hostname === "youtu.be" || u.hostname.endsWith(".youtu.be")) return u.pathname.slice(1).split("/")[0];
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
    }
  } catch {}
  return null;
}

app.post("/api/generate", async (req,res)=>{
  try {
    const {url, language="Hindi", noteType="exam"} = req.body;
    const id = getVideoId(url || "");
    if (!id) return res.status(400).json({error:"Valid YouTube video link डालें।"});
    if (!client) return res.status(500).json({error:"Server पर OPENAI_API_KEY सेट नहीं है।"});

    const transcript = await YoutubeTranscript.fetchTranscript(id);
    if (!transcript?.length) throw new Error("इस वीडियो का accessible transcript/captions नहीं मिला।");

    const text = transcript.map(x=>x.text).join(" ").replace(/\s+/g," ").slice(0,140000);
    const typeText = {
      exam:"परीक्षा-केंद्रित विस्तृत notes",
      complete:"विस्तृत complete notes",
      short:"संक्षिप्त revision notes"
    }[noteType] || "परीक्षा-केंद्रित notes";

    const prompt = `You are an expert teacher and study-note maker.
Create ${typeText} from the supplied YouTube transcript.
Output language: ${language}.
Structure:
1. Title
2. Overview
3. Main topics with headings/subheadings
4. Key definitions/facts
5. Examples where supported by the transcript
6. Quick revision points
7. 10 important exam questions with short answers
Do not invent information that is absent from the transcript. If the transcript is unclear, say so.
Use plain text only. Make it easy to print on A4 pages.

Transcript:
${text}`;

    const r = await client.responses.create({model, input:prompt});
    res.json({notes:r.output_text || "Notes generate नहीं हुए।"});
  } catch(e) {
    res.status(500).json({error:e?.message || "Notes generate नहीं हो सके।"});
  }
});

app.post("/api/pdf", (req,res)=>{
  const {notes, title="YouTube Video Notes", language="Hindi"} = req.body;
  if (!notes) return res.status(400).send("Notes missing");
  res.setHeader("Content-Type","application/pdf");
  res.setHeader("Content-Disposition",'attachment; filename="youtube-notes-A4.pdf"');

  const doc = new PDFDocument({size:"A4", margin:45, info:{Title:title}});
  doc.pipe(res);
  doc.font("Helvetica-Bold").fontSize(19).text(title,{align:"center"});
  doc.moveDown(.4);
  doc.font("Helvetica").fontSize(9).text(`Language: ${language}  |  Generated: ${new Date().toLocaleDateString("en-IN")}`,{align:"center"});
  doc.moveDown();
  doc.fontSize(11).text(notes,{lineGap:4, paragraphGap:7});
  doc.end();
});

app.get("/health",(req,res)=>res.json({ok:true}));
app.listen(port,()=>console.log(`Server running on port ${port}`));
