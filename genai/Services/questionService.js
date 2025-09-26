// Services/questionService.js
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from '@langchain/qdrant';
import { GoogleGenAI } from "@google/genai";
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1️⃣ Index PDF into Qdrant
export async function indexPDF(pdfPath) {
  const pdfLoader = new PDFLoader(pdfPath);
  const rawDocs = await pdfLoader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const chunkedDocs = await textSplitter.splitDocuments(rawDocs);

  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "text-embedding-004",
  });

  const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  await QdrantVectorStore.fromDocuments(chunkedDocs, embeddings, {
    client: qdrantClient,
    collectionName: process.env.QDRANT_COLLECTION_NAME,
  });

  return true;
}

// 2️⃣ Generate Questions from topic
export async function generateQuestions(numQuestions, topic) {
  const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GEMINI_API_KEY,
    model: "text-embedding-004",
  });

  const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    client: qdrantClient,
    collectionName: process.env.QDRANT_COLLECTION_NAME,
  });

  const searchResults = await vectorStore.similaritySearch(topic, 10);
  const context = searchResults.map(doc => doc.pageContent).join("\n\n---\n\n");

  const prompt = `
You are a MICROPROCESSOR subject expert.
Generate exactly ${numQuestions} unique questions based on the provided context.
Output must be a valid JSON array with this schema:

{
  "question_text": "String",
  "answer": "String",
  "difficulty": "easy" | "medium" | "hard",
  "question_type": "listening" | "grasping" | "retention" | "application"
}

Context:
${context}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  let rawText = response.text;

// Remove ```json or ``` wrapping
let jsonStr = rawText.replace(/```json|```/g, '').trim();

let questions;
try {
    questions = JSON.parse(jsonStr);
} catch (err) {
    console.error("AI response that failed parsing:", rawText);
    throw new Error("Failed to parse AI response into JSON.");
}


  // Return array ready to insert into MongoDB
  return questions;
}
