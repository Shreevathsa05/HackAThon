import * as dotenv from 'dotenv';
dotenv.config();

import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { PPTXLoader } from "@langchain/community/document_loaders/fs/pptx";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { fileURLToPath } from "url";
import { QdrantVectorStore } from '@langchain/qdrant';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let CHUNK_SIZE = 2000;
let CHUNK_OVERLAP = 300;

async function loadDocument(fileName) {
    const filePath = path.join(__dirname, "", fileName);

    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const ext = path.extname(fileName).toLowerCase();
    let loader;
    let rawDocs = [];

    switch (ext) {
        case ".pdf":
            loader = new PDFLoader(filePath);
            rawDocs = await loader.load();
            break;

        case ".docx":
            loader = new DocxLoader(filePath);
            rawDocs = await loader.load();
            break;

        case ".doc":
            loader = new DocxLoader(filePath, { type: "doc" });
            rawDocs = await loader.load();
            break;

        case ".pptx":
            loader = new PPTXLoader(filePath);
            rawDocs = await loader.load();
            break;

        case ".txt":
            loader = new TextLoader(filePath);
            rawDocs = await loader.load();
            break;

        case ".csv":
            loader = new CSVLoader(filePath);
            rawDocs = await loader.load();
            break;

        case ".xls":
        case ".xlsx":
            const workbook = XLSX.readFile(filePath);
            const sheetNames = workbook.SheetNames;

            for (const sheetName of sheetNames) {
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                jsonData.forEach((row, rowIndex) => {
                    rawDocs.push({
                        pageContent: row.join(", "),
                        metadata: { sheet: sheetName, row: rowIndex }
                    });
                });
            }
            break;

        default:
            throw new Error(`Unsupported file type: ${ext}`);
    }

    // chunk docs
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);
    console.log("Chunking Completed");

    // vector embeddings
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });
    console.log("Embedding configured");

    const vectorStore = await QdrantVectorStore.fromDocuments(chunkedDocs, embeddings, {
        url: "http://localhost:6333",
        collectionName: "doc_chunks",
        createCollectionIfNotExists: true,
        timeout: 10000,
    });
    console.log("Uploaded sucessfully",fileName)
}
// loadDocument('../Resume_Shreevathsa1.pdf')