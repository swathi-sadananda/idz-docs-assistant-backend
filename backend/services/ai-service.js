const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

class AIService {
  constructor() {
    // Check which AI service to use
    this.useHuggingFace = !!process.env.HUGGINGFACE_API_KEY;
    this.useOpenAI = !!process.env.OPENAI_API_KEY;
    this.useLocalLLM = process.env.USE_LOCAL_LLM === 'true';
    
    if (this.useOpenAI && !this.useLocalLLM) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.model = process.env.OPENAI_MODEL || 'gpt-4';
    } else if (this.useHuggingFace) {
      this.huggingFaceKey = process.env.HUGGINGFACE_API_KEY;
      this.huggingFaceModel = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';
    } else if (this.useLocalLLM) {
      this.localEndpoint = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434';
    }

    this.conversationHistory = new Map();
  }

  /**
   * Generate response to user message
   */
  async generateResponse({ userMessage, relevantDocs, conversationId, pageContext }) {
    try {
      // Build context from relevant documentation
      const context = this.buildContext(relevantDocs);
      
      // Get or create conversation history
      const history = this.getConversationHistory(conversationId);
      
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(context, pageContext);
      
      // Generate response
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history,
        { role: 'user', content: userMessage }
      ];

      let responseText;
      if (this.useLocalLLM) {
        responseText = await this.generateLocalLLMResponse(messages);
      } else if (this.useHuggingFace) {
        responseText = await this.generateHuggingFaceResponse(messages);
      } else if (this.useOpenAI) {
        responseText = await this.generateOpenAIResponse(messages);
      } else {
        throw new Error('No AI service configured. Please set HUGGINGFACE_API_KEY, OPENAI_API_KEY, or USE_LOCAL_LLM=true');
      }

      // Update conversation history
      history.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: responseText }
      );
      this.conversationHistory.set(conversationId || this.generateConversationId(), history);

      // Extract steps if present
      const steps = this.extractSteps(responseText);
      
      // Generate suggestions
      const suggestions = this.generateSuggestions(userMessage, relevantDocs);

      return {
        text: responseText,
        conversationId: conversationId || this.generateConversationId(),
        sources: relevantDocs.map(doc => ({
          title: doc.title,
          url: this.getDocUrl(doc),
          type: doc.type
        })),
        suggestions,
        hasSteps: steps.length > 0,
        steps
      };

    } catch (error) {
      console.error('AI Service error:', error);
      throw new Error('Failed to generate response');
    }
  }

  /**
   * Generate step-by-step guide
   */
  async generateStepByStep({ task, relevantDocs, context }) {
    try {
      const docsContext = this.buildContext(relevantDocs);
      
      const prompt = `Based on the following documentation, provide a detailed step-by-step guide for: "${task}"

Documentation Context:
${docsContext}

Please provide:
1. Clear, numbered steps
2. Prerequisites (if any)
3. Tips or warnings (if applicable)
4. Expected results

Format your response as:
PREREQUISITES:
[List prerequisites]

STEPS:
1. [First step]
2. [Second step]
...

TIPS:
[Any helpful tips]`;

      const messages = [
        { role: 'system', content: 'You are a technical documentation expert for IBM Developer for z/OS. Provide clear, accurate step-by-step instructions.' },
        { role: 'user', content: prompt }
      ];

      let response;
      if (this.useLocalLLM) {
        response = await this.generateLocalLLMResponse(messages);
      } else if (this.useHuggingFace) {
        response = await this.generateHuggingFaceResponse(messages);
      } else if (this.useOpenAI) {
        response = await this.generateOpenAIResponse(messages);
      } else {
        throw new Error('No AI service configured');
      }

      return this.parseStepByStepResponse(response, relevantDocs);

    } catch (error) {
      console.error('Step-by-step generation error:', error);
      throw new Error('Failed to generate step-by-step guide');
    }
  }

  /**
   * Explain a concept
   */
  async explainConcept({ concept, level, relevantDocs }) {
    try {
      const docsContext = this.buildContext(relevantDocs);
      
      const levelDescriptions = {
        beginner: 'simple terms suitable for beginners',
        intermediate: 'moderate detail for users with some experience',
        advanced: 'technical depth for experienced users'
      };

      const prompt = `Explain the concept of "${concept}" in ${levelDescriptions[level] || levelDescriptions.intermediate}.

Documentation Context:
${docsContext}

Please provide:
1. A clear explanation
2. Practical examples
3. Related concepts
4. Common use cases`;

      const messages = [
        { role: 'system', content: 'You are a technical documentation expert for IBM Developer for z/OS. Explain concepts clearly and accurately.' },
        { role: 'user', content: prompt }
      ];

      let response;
      if (this.useLocalLLM) {
        response = await this.generateLocalLLMResponse(messages);
      } else if (this.useHuggingFace) {
        response = await this.generateHuggingFaceResponse(messages);
      } else if (this.useOpenAI) {
        response = await this.generateOpenAIResponse(messages);
      } else {
        throw new Error('No AI service configured');
      }

      return this.parseExplanationResponse(response, relevantDocs);

    } catch (error) {
      console.error('Concept explanation error:', error);
      throw new Error('Failed to explain concept');
    }
  }

  /**
   * Generate OpenAI response
   */
  async generateOpenAIResponse(messages) {
    const completion = await this.openai.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0].message.content;
  }

  /**
   * Generate local LLM response
   */
  async generateLocalLLMResponse(messages) {
    const response = await fetch(`${this.localEndpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt: this.formatMessagesForLocal(messages),
        stream: false
      })
    });

    const data = await response.json();
    return data.response;
  }

  /**
   * Generate Hugging Face response
   */
  async generateHuggingFaceResponse(messages) {
    try {
      // Extract user question
      const userMessage = messages.find(m => m.role === 'user')?.content || '';
      
      // For now, return a helpful response based on documentation context
      // This is a fallback until we can resolve the Hugging Face API connectivity issue
      const response = this.generateFallbackResponse(userMessage, messages);
      return response;
      
    } catch (error) {
      console.error('Response generation error:', error);
      return this.generateFallbackResponse('', messages);
    }
  }

  /**
   * Generate fallback response when AI service is unavailable
   */
  generateFallbackResponse(userMessage, messages) {
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    
    // Extract documentation context from system message
    const hasContext = systemMessage.includes('Documentation Context:');
    
    if (!hasContext) {
      return `I'm here to help you with IBM Developer for z/OS documentation.

To get started:
1. Visit the IBM Docs website for IDz
2. Browse through the available topics
3. Ask me specific questions about features, installation, or usage

What would you like to know about IDz?`;
    }
    
    // Extract relevant doc info from system message
    const docMatch = systemMessage.match(/Title: (.+?)\nType: (.+?)\nContent: (.+?)\.\.\./)
;
    
    if (docMatch) {
      const [, title, type, content] = docMatch;
      return `Based on the documentation "${title}":

${content.substring(0, 300)}...

For complete information, please refer to the full documentation on the IBM Docs website.

Would you like me to help you with something specific about this topic?`;
    }
    
    return `I found relevant documentation for your question. Please visit the IBM Developer for z/OS documentation website for detailed information.

Common topics include:
- Installation and setup
- Development features
- Debugging tools
- Integration with z/OS

What specific aspect would you like to learn more about?`;
  }

  /**
   * Build system prompt with context
   */
  buildSystemPrompt(docsContext, pageContext) {
    return `You are an AI assistant for IBM Developer for z/OS (IDz) documentation. Your role is to help users understand and use IDz effectively.

Current Context:
${pageContext ? `User is viewing: ${pageContext.page}` : 'General documentation'}

Relevant Documentation:
${docsContext}

Guidelines:
1. Provide accurate, helpful answers based on the documentation
2. If you're not sure, say so and suggest where to find more information
3. Break down complex tasks into clear steps
4. Use examples when helpful
5. Reference specific documentation sections when relevant
6. Be concise but thorough
7. If the question is about a specific version, note any version-specific information

Remember: You're helping developers work with mainframe development tools. Be technical but clear.`;
  }

  /**
   * Build context from relevant documents
   */
  buildContext(docs) {
    if (!docs || docs.length === 0) {
      return 'No specific documentation found for this query.';
    }

    return docs.map((doc, index) => {
      return `[Document ${index + 1}]
Title: ${doc.title}
Type: ${doc.type}
Content: ${doc.content.substring(0, 500)}...
${doc.sections && doc.sections.length > 0 ? `Sections: ${doc.sections.map(s => s.title).join(', ')}` : ''}
`;
    }).join('\n---\n');
  }

  /**
   * Extract steps from response
   */
  extractSteps(text) {
    const steps = [];
    const stepRegex = /^\d+\.\s+(.+)$/gm;
    let match;

    while ((match = stepRegex.exec(text)) !== null) {
      steps.push(match[1].trim());
    }

    return steps;
  }

  /**
   * Parse step-by-step response
   */
  parseStepByStepResponse(response, docs) {
    const sections = {
      prerequisites: [],
      steps: [],
      tips: []
    };

    const lines = response.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('PREREQUISITES:')) {
        currentSection = 'prerequisites';
      } else if (trimmed.startsWith('STEPS:')) {
        currentSection = 'steps';
      } else if (trimmed.startsWith('TIPS:')) {
        currentSection = 'tips';
      } else if (trimmed && currentSection) {
        sections[currentSection].push(trimmed);
      }
    }

    return {
      prerequisites: sections.prerequisites,
      steps: sections.steps,
      tips: sections.tips,
      sources: docs.map(doc => ({
        title: doc.title,
        url: this.getDocUrl(doc)
      }))
    };
  }

  /**
   * Parse explanation response
   */
  parseExplanationResponse(response, docs) {
    // Extract examples and related topics
    const examples = [];
    const relatedTopics = [];

    // Simple parsing - can be enhanced
    const exampleRegex = /Example:(.+?)(?=\n\n|Related|$)/gs;
    const relatedRegex = /Related concepts?:(.+?)(?=\n\n|$)/gs;

    let match;
    while ((match = exampleRegex.exec(response)) !== null) {
      examples.push(match[1].trim());
    }

    while ((match = relatedRegex.exec(response)) !== null) {
      const topics = match[1].split(',').map(t => t.trim());
      relatedTopics.push(...topics);
    }

    return {
      text: response,
      examples,
      relatedTopics,
      sources: docs.map(doc => ({
        title: doc.title,
        url: this.getDocUrl(doc)
      }))
    };
  }

  /**
   * Generate follow-up suggestions
   */
  generateSuggestions(userMessage, docs) {
    const suggestions = [];
    
    // Based on document types
    if (docs.some(d => d.type === 'task')) {
      suggestions.push('Show me step-by-step instructions');
    }
    
    if (docs.some(d => d.type === 'concept')) {
      suggestions.push('Explain this in more detail');
    }

    // Based on common patterns
    if (userMessage.toLowerCase().includes('how')) {
      suggestions.push('What are the prerequisites?');
      suggestions.push('Are there any examples?');
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Get conversation history
   */
  getConversationHistory(conversationId) {
    if (!conversationId) return [];
    return this.conversationHistory.get(conversationId) || [];
  }

  /**
   * Generate conversation ID
   */
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get documentation URL
   */
  getDocUrl(doc) {
    // Convert file path to IBM Docs URL
    const baseUrl = 'https://www.ibm.com/docs/en/developer-for-zos/17.0.x';
    const relativePath = doc.filePath.replace(/^.*?com\.ibm\./, '').replace(/\.dita$/, '.html');
    return `${baseUrl}/${relativePath}`;
  }

  /**
   * Format messages for local LLM
   */
  formatMessagesForLocal(messages) {
    return messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  }

  /**
   * Store feedback
   */
  async storeFeedback(feedback) {
    // Store in database or file for analytics
    console.log('Feedback received:', feedback);
    // TODO: Implement persistent storage
  }

  /**
   * Get suggestions for page
   */
  async getSuggestions({ page, topic }) {
    // Return contextual suggestions based on page
    const suggestions = [
      'How do I get started?',
      'What are the main features?',
      'Show me examples'
    ];

    if (topic) {
      suggestions.unshift(`Tell me more about ${topic}`);
    }

    return suggestions;
  }
}

module.exports = AIService;

// Made with Bob
