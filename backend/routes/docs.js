const express = require('express');
const router = express.Router();
const DITAParser = require('../parsers/dita-parser');

const parser = new DITAParser();

/**
 * GET /api/docs/:id
 * Get specific document
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would fetch from a database
    // For now, return a placeholder
    res.json({
      id,
      title: 'Document Title',
      content: 'Document content would be here',
      type: 'concept'
    });

  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ 
      error: 'Failed to get document',
      message: error.message 
    });
  }
});

/**
 * GET /api/docs/structure
 * Get documentation structure
 */
router.get('/structure', async (req, res) => {
  try {
    const docsPath = process.env.DOCS_PATH || '../';
    
    // Find all DITAMAP files
    const ditamaps = await parser.findDITAMaps(docsPath);
    
    res.json({
      total: ditamaps.length,
      maps: ditamaps.slice(0, 10) // Return first 10 for demo
    });

  } catch (error) {
    console.error('Get structure error:', error);
    res.status(500).json({ 
      error: 'Failed to get documentation structure',
      message: error.message 
    });
  }
});

module.exports = router;

// Made with Bob
