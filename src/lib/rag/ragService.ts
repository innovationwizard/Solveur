// import { PineconeService } from './pineconeService';
// import { EmbeddingService } from './embeddingService';
// import { KnowledgeBase } from '../knowledge/knowledgeBase';

export interface RAGContext {
  text: string;
  sources: string[];
}

export class RAGService {
  private pineconeService: PineconeService;
  private embeddingService: EmbeddingService;
  private knowledgeBase: KnowledgeBase;

  constructor() {
    this.pineconeService = new PineconeService();
    this.embeddingService = new EmbeddingService();
    this.knowledgeBase = new KnowledgeBase();
  }

  async getRelevantContext(query: string): Promise<RAGContext> {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      
      // Search for similar content in Pinecone
      const searchResults = await this.pineconeService.search(queryEmbedding, 5);
      
      // Extract relevant text and sources
      const relevantTexts = searchResults.map(result => result.metadata?.text || '');
      const sources = searchResults.map(result => result.metadata?.source || '');
      
      // Combine context
      const context = relevantTexts.join('\n\n');
      
    return {
      text: context,
      sources: Array.from(new Set(sources)), // Remove duplicates
    };
    } catch (error) {
      console.error('RAG Service error:', error);
      
      // Fallback to static knowledge base
      return {
        text: this.knowledgeBase.getStaticContext(query),
        sources: ['CloudWalk Knowledge Base'],
      };
    }
  }

  async initializeKnowledgeBase(): Promise<void> {
    try {
      const documents = this.knowledgeBase.getAllDocuments();
      
      for (const doc of documents) {
        const embedding = await this.embeddingService.generateEmbedding(doc.content);
        await this.pineconeService.upsert(doc.id, embedding, doc.metadata);
      }
      
      console.log('Knowledge base initialized successfully');
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
    }
  }
}