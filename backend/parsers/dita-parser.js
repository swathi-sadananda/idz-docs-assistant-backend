const fs = require('fs').promises;
const path = require('path');
const xml2js = require('xml2js');
const { glob } = require('glob');

class DITAParser {
  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      trim: true
    });
  }

  /**
   * Parse a DITA file and extract content
   */
  async parseDITAFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const result = await this.parser.parseStringPromise(content);
      
      return this.extractContent(result, filePath);
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error.message);
      return null;
    }
  }

  /**
   * Extract meaningful content from parsed DITA
   */
  extractContent(data, filePath) {
    const doc = {
      filePath,
      fileName: path.basename(filePath),
      type: this.getDocType(data),
      title: '',
      shortdesc: '',
      content: '',
      sections: [],
      metadata: {}
    };

    // Extract based on document type
    if (data.concept) {
      this.extractConcept(data.concept, doc);
    } else if (data.task) {
      this.extractTask(data.task, doc);
    } else if (data.reference) {
      this.extractReference(data.reference, doc);
    } else if (data.topic) {
      this.extractTopic(data.topic, doc);
    }

    return doc;
  }

  /**
   * Extract concept content
   */
  extractConcept(concept, doc) {
    doc.title = this.extractText(concept.title);
    doc.shortdesc = this.extractText(concept.shortdesc);
    
    if (concept.conbody) {
      doc.content = this.extractBodyContent(concept.conbody);
      doc.sections = this.extractSections(concept.conbody);
    }

    doc.metadata = this.extractMetadata(concept);
  }

  /**
   * Extract task content with steps
   */
  extractTask(task, doc) {
    doc.title = this.extractText(task.title);
    doc.shortdesc = this.extractText(task.shortdesc);
    
    if (task.taskbody) {
      const taskbody = task.taskbody;
      
      // Extract prerequisites
      if (taskbody.prereq) {
        doc.sections.push({
          type: 'prereq',
          title: 'Prerequisites',
          content: this.extractText(taskbody.prereq)
        });
      }

      // Extract context
      if (taskbody.context) {
        doc.sections.push({
          type: 'context',
          title: 'Context',
          content: this.extractText(taskbody.context)
        });
      }

      // Extract steps
      if (taskbody.steps) {
        const steps = this.extractSteps(taskbody.steps);
        doc.sections.push({
          type: 'steps',
          title: 'Steps',
          content: steps
        });
      }

      // Extract result
      if (taskbody.result) {
        doc.sections.push({
          type: 'result',
          title: 'Result',
          content: this.extractText(taskbody.result)
        });
      }

      doc.content = doc.sections.map(s => s.content).join('\n\n');
    }

    doc.metadata = this.extractMetadata(task);
  }

  /**
   * Extract reference content
   */
  extractReference(reference, doc) {
    doc.title = this.extractText(reference.title);
    doc.shortdesc = this.extractText(reference.shortdesc);
    
    if (reference.refbody) {
      doc.content = this.extractBodyContent(reference.refbody);
      doc.sections = this.extractSections(reference.refbody);
    }

    doc.metadata = this.extractMetadata(reference);
  }

  /**
   * Extract generic topic content
   */
  extractTopic(topic, doc) {
    doc.title = this.extractText(topic.title);
    doc.shortdesc = this.extractText(topic.shortdesc);
    
    if (topic.body) {
      doc.content = this.extractBodyContent(topic.body);
      doc.sections = this.extractSections(topic.body);
    }

    doc.metadata = this.extractMetadata(topic);
  }

  /**
   * Extract steps from task
   */
  extractSteps(stepsElement) {
    const steps = [];
    const stepList = Array.isArray(stepsElement.step) 
      ? stepsElement.step 
      : [stepsElement.step];

    stepList.forEach((step, index) => {
      if (step) {
        const cmd = this.extractText(step.cmd);
        const info = step.info ? this.extractText(step.info) : '';
        steps.push(`${index + 1}. ${cmd}${info ? '\n   ' + info : ''}`);
      }
    });

    return steps.join('\n');
  }

  /**
   * Extract body content
   */
  extractBodyContent(body) {
    let content = [];
    
    if (body.p) {
      const paragraphs = Array.isArray(body.p) ? body.p : [body.p];
      content.push(...paragraphs.map(p => this.extractText(p)));
    }

    if (body.section) {
      const sections = Array.isArray(body.section) ? body.section : [body.section];
      sections.forEach(section => {
        content.push(this.extractText(section));
      });
    }

    return content.join('\n\n');
  }

  /**
   * Extract sections
   */
  extractSections(body) {
    const sections = [];
    
    if (body.section) {
      const sectionList = Array.isArray(body.section) ? body.section : [body.section];
      sectionList.forEach(section => {
        sections.push({
          type: 'section',
          title: this.extractText(section.title) || '',
          content: this.extractText(section)
        });
      });
    }

    return sections;
  }

  /**
   * Extract text from any element
   */
  extractText(element) {
    if (!element) return '';
    if (typeof element === 'string') return element.trim();
    if (typeof element === 'object') {
      if (element._) return element._.trim();
      if (element.p) {
        const paragraphs = Array.isArray(element.p) ? element.p : [element.p];
        return paragraphs.map(p => this.extractText(p)).join('\n');
      }
      return Object.values(element)
        .filter(v => typeof v === 'string')
        .join(' ')
        .trim();
    }
    return '';
  }

  /**
   * Extract metadata
   */
  extractMetadata(element) {
    const metadata = {};
    
    if (element.id) metadata.id = element.id;
    if (element.audience) metadata.audience = element.audience;
    if (element.platform) metadata.platform = element.platform;
    if (element.product) metadata.product = element.product;
    
    return metadata;
  }

  /**
   * Get document type
   */
  getDocType(data) {
    if (data.concept) return 'concept';
    if (data.task) return 'task';
    if (data.reference) return 'reference';
    if (data.topic) return 'topic';
    return 'unknown';
  }

  /**
   * Parse DITAMAP file to get document structure
   */
  async parseDITAMap(mapPath) {
    try {
      const content = await fs.readFile(mapPath, 'utf-8');
      const result = await this.parser.parseStringPromise(content);
      
      const map = {
        filePath: mapPath,
        title: '',
        topics: []
      };

      if (result.map) {
        map.title = this.extractText(result.map.title);
        map.topics = this.extractTopicRefs(result.map, path.dirname(mapPath));
      }

      return map;
    } catch (error) {
      console.error(`Error parsing DITAMAP ${mapPath}:`, error.message);
      return null;
    }
  }

  /**
   * Extract topic references from map
   */
  extractTopicRefs(mapElement, basePath) {
    const topics = [];
    
    const processTopicRef = (topicref) => {
      if (!topicref) return;
      
      const topic = {
        href: topicref.href ? path.join(basePath, topicref.href) : null,
        navtitle: topicref.navtitle || '',
        type: topicref.type || '',
        children: []
      };

      if (topicref.topicref) {
        const children = Array.isArray(topicref.topicref) 
          ? topicref.topicref 
          : [topicref.topicref];
        topic.children = children.map(child => processTopicRef(child)).filter(Boolean);
      }

      return topic;
    };

    if (mapElement.topicref) {
      const topicrefs = Array.isArray(mapElement.topicref) 
        ? mapElement.topicref 
        : [mapElement.topicref];
      topics.push(...topicrefs.map(ref => processTopicRef(ref)).filter(Boolean));
    }

    return topics;
  }

  /**
   * Find all DITA files in a directory
   */
  async findDITAFiles(directory) {
    const pattern = path.join(directory, '**/*.dita');
    return await glob(pattern, { ignore: '**/node_modules/**' });
  }

  /**
   * Find all DITAMAP files in a directory
   */
  async findDITAMaps(directory) {
    const pattern = path.join(directory, '**/*.ditamap');
    return await glob(pattern, { ignore: '**/node_modules/**' });
  }

  /**
   * Search DITA docs for keywords
   */
  async searchDocs(directory, keywords) {
    try {
      const ditaFiles = await this.findDITAFiles(directory);
      const results = [];

      // Parse and search through files
      for (const file of ditaFiles.slice(0, 50)) { // Increased to 50 files for better results
        try {
          // Skip conref files (reusable content references)
          if (file.includes('conref') || file.includes('_conrefs')) {
            continue;
          }

          const doc = await this.parseDITAFile(file);
          if (!doc) continue;

          // Skip if document has no meaningful content
          if (!doc.content || doc.content.length < 50) {
            continue;
          }

          // Calculate relevance score
          let score = 0;
          const searchText = `${doc.title} ${doc.shortdesc} ${doc.content}`.toLowerCase();
          
          keywords.forEach(keyword => {
            const keywordLower = keyword.toLowerCase();
            const count = (searchText.match(new RegExp(keywordLower, 'g')) || []).length;
            score += count * 10;
            
            // Boost score if keyword is in title
            if (doc.title.toLowerCase().includes(keywordLower)) {
              score += 100; // Increased boost for title matches
            }
            
            // Boost score if keyword is in shortdesc
            if (doc.shortdesc && doc.shortdesc.toLowerCase().includes(keywordLower)) {
              score += 50;
            }
          });

          // Only include documents with meaningful scores
          if (score > 20) {
            results.push({
              ...doc,
              score
            });
          }
        } catch (error) {
          // Skip files that fail to parse
          continue;
        }
      }

      // Sort by relevance score
      results.sort((a, b) => b.score - a.score);
      return results.slice(0, 5); // Return top 5 results

    } catch (error) {
      console.error('Search docs error:', error);
      return [];
    }
  }
}

module.exports = DITAParser;

// Made with Bob
