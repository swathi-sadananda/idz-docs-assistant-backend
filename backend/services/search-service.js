const DITAParser = require('../parsers/dita-parser');
const path = require('path');

class SearchService {
  constructor() {
    this.parser = new DITAParser();
    this.documentsCache = [];
    this.initialized = false;
  }

  /**
   * Initialize the search service by loading documents
   */
  async initialize() {
    if (this.initialized) return;

    try {
      console.log('Initializing search service...');
      const docsPath = process.env.DOCS_PATH || path.join(__dirname, '../../..');
      
      // Find and parse DITA files
      const ditaFiles = await this.parser.findDITAFiles(docsPath);
      console.log(`Found ${ditaFiles.length} DITA files`);
      
      // Parse a subset for demo (parsing all files takes time)
      const filesToParse = ditaFiles.slice(0, 50);
      
      for (const file of filesToParse) {
        try {
          const doc = await this.parser.parseDITAFile(file);
          if (doc) {
            this.documentsCache.push(doc);
          }
        } catch (error) {
          console.error(`Error parsing ${file}:`, error.message);
        }
      }
      
      console.log(`Loaded ${this.documentsCache.length} documents into cache`);
      this.initialized = true;
      
    } catch (error) {
      console.error('Search service initialization error:', error);
      // Continue with empty cache
      this.initialized = true;
    }
  }

  /**
   * Search documents
   */
  async search(query, options = {}) {
    await this.initialize();

    const {
      topK = 5,
      threshold = 0.3,
      docType = null
    } = options;

    // Simple text-based search (in production, use vector embeddings)
    const results = this.documentsCache
      .map(doc => ({
        ...doc,
        score: this.calculateRelevance(query, doc)
      }))
      .filter(doc => {
        if (docType && doc.type !== docType) return false;
        return doc.score >= threshold;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  /**
   * Calculate relevance score (simple implementation)
   */
  calculateRelevance(query, doc) {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/);
    
    let score = 0;
    const titleLower = (doc.title || '').toLowerCase();
    const contentLower = (doc.content || '').toLowerCase();
    const shortdescLower = (doc.shortdesc || '').toLowerCase();

    // Title matches are most important
    queryTerms.forEach(term => {
      if (titleLower.includes(term)) score += 3;
      if (shortdescLower.includes(term)) score += 2;
      if (contentLower.includes(term)) score += 1;
    });

    // Exact phrase match bonus
    if (titleLower.includes(queryLower)) score += 5;
    if (contentLower.includes(queryLower)) score += 2;

    // Normalize score
    return Math.min(score / 10, 1.0);
  }

  /**
   * Find related topics
   */
  async findRelated(topic, limit = 5) {
    await this.initialize();

    // Find documents related to the topic
    const results = await this.search(topic, { topK: limit + 1 });
    
    // Remove the exact match if present
    return results
      .filter(doc => doc.title.toLowerCase() !== topic.toLowerCase())
      .slice(0, limit);
  }

  /**
   * Get document by ID
   */
  async getDocument(id) {
    await this.initialize();
    return this.documentsCache.find(doc => doc.metadata?.id === id);
  }

  /**
   * Get all documents of a specific type
   */
  async getDocumentsByType(type) {
    await this.initialize();
    return this.documentsCache.filter(doc => doc.type === type);
  }

  /**
   * Get statistics
   */
  async getStats() {
    await this.initialize();
    
    const stats = {
      total: this.documentsCache.length,
      byType: {}
    };

    this.documentsCache.forEach(doc => {
      stats.byType[doc.type] = (stats.byType[doc.type] || 0) + 1;
    });

    return stats;
  }
}

module.exports = SearchService;

// Made with Bob
