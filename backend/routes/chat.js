const express = require('express');
const router = express.Router();
const AIService = require('../services/ai-service');
const SearchService = require('../services/search-service');

const aiService = new AIService();
const searchService = new SearchService();

/**
 * POST /api/chat
 * Main chat endpoint for conversational Q&A
 */
router.post('/', async (req, res) => {
  try {
    const { message, conversationId, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Search for relevant documentation
    const relevantDocs = await searchService.search(message, {
      topK: 5,
      threshold: 0.7
    });

    // Generate AI response with context
    const response = await aiService.generateResponse({
      userMessage: message,
      relevantDocs,
      conversationId,
      pageContext: context
    });

    res.json({
      response: response.text,
      conversationId: response.conversationId,
      sources: response.sources,
      suggestions: response.suggestions,
      hasSteps: response.hasSteps,
      steps: response.steps
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message 
    });
  }
});

/**
 * POST /api/chat/steps
 * Get step-by-step instructions for a task
 */
router.post('/steps', async (req, res) => {
  try {
    const { task, context } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task description is required' });
    }

    // Search for task-related documentation
    const taskDocs = await searchService.search(task, {
      topK: 3,
      docType: 'task'
    });

    // Generate step-by-step guide
    const steps = await aiService.generateStepByStep({
      task,
      relevantDocs: taskDocs,
      context
    });

    res.json({
      task,
      steps: steps.steps,
      prerequisites: steps.prerequisites,
      tips: steps.tips,
      sources: steps.sources
    });

  } catch (error) {
    console.error('Steps generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate steps',
      message: error.message 
    });
  }
});

/**
 * POST /api/chat/explain
 * Get detailed explanation of a concept
 */
router.post('/explain', async (req, res) => {
  try {
    const { concept, level } = req.body;

    if (!concept) {
      return res.status(400).json({ error: 'Concept is required' });
    }

    // Search for concept documentation
    const conceptDocs = await searchService.search(concept, {
      topK: 3,
      docType: 'concept'
    });

    // Generate explanation
    const explanation = await aiService.explainConcept({
      concept,
      level: level || 'intermediate',
      relevantDocs: conceptDocs
    });

    res.json({
      concept,
      explanation: explanation.text,
      examples: explanation.examples,
      relatedTopics: explanation.relatedTopics,
      sources: explanation.sources
    });

  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate explanation',
      message: error.message 
    });
  }
});

/**
 * POST /api/chat/feedback
 * Submit feedback on assistant response
 */
router.post('/feedback', async (req, res) => {
  try {
    const { conversationId, messageId, rating, comment } = req.body;

    // Store feedback for analytics
    await aiService.storeFeedback({
      conversationId,
      messageId,
      rating,
      comment,
      timestamp: new Date()
    });

    res.json({ success: true, message: 'Feedback received' });

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      message: error.message 
    });
  }
});

/**
 * GET /api/chat/suggestions
 * Get suggested questions based on current page
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { page, topic } = req.query;

    const suggestions = await aiService.getSuggestions({
      page,
      topic
    });

    res.json({ suggestions });

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ 
      error: 'Failed to get suggestions',
      message: error.message 
    });
  }
});

module.exports = router;

// Made with Bob
