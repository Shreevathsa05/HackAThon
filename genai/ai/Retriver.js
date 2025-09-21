import * as dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantVectorStore } from '@langchain/qdrant';
import { QdrantClient } from "@qdrant/js-client-rest";

export async function retrieve(query, collectionName = "doc_chunks") {
    const embedding = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    })

    const qdrantClient = new QdrantClient({ url: process.env.QDRANT_URL })

    const vectorStore = new QdrantVectorStore(embedding, {
        collectionName,
        client: qdrantClient,
    })

    const retriver = vectorStore.asRetriever()
    const results = await retriver._getRelevantDocuments(query)

    return results.map(doc => doc.pageContent)
}

export async function getAllDocs(collectionName = "doc_chunks") {
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    })
    const qdrantClient = new QdrantClient({ url: process.env.QDRANT_URL })


    const vectorStore = new QdrantVectorStore(embeddings, {
        client: qdrantClient,
        collectionName,
    });

    // Hack: search with an empty string (or " ") to fetch everything
    // Increase `k` if you want more docs
    const results = await vectorStore.similaritySearch(" ", 1000);

    // Extract page content
    return results.map(r => r.pageContent);
}

// (
//     async () => {
//         console.log(await retrieve("Shreevathsa"))
//     }
// )()