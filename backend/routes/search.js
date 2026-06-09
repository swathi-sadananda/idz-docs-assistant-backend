const express = require('express');
const router = express.Router();
const SearchService = require('../services/search-service');

const searchService = new SearchService();

/**
 * POST /api/search
 * Search documentation
 */
router.post('/', async (req, res) => {
  try {
    const { query, filters } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await searchService.search(query, filters);

    res.json({
      query,
      results,
      total: results.length
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed',
      message: error.message 
    });
  }
});

/**
 * GET /api/search/related
 * Get related topics
 */
router.get('/related', async (req, res) => {
  try {
    const { topic, limit } = req.query;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const related = await searchService.findRelated(topic, parseInt(limit) || 5);

    res.json({ topic, related });

  } catch (error) {
    console.error('Related topics error:', error);
    res.status(500).json({ 
      error: 'Failed to find related topics',
      message: error.message 
    });
  }
});

module.exports = router;

// Made with Bob
