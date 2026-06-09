# Interactive Documentation Assistant

An AI-powered assistant for IBM Developer for z/OS documentation that answers user questions and provides step-by-step guidance.

## Features

- 🤖 **AI-Powered Q&A**: Natural language question answering
- 📚 **DITA Documentation Support**: Parses and indexes DITA/DITAMAP files
- 🔍 **Smart Search**: Semantic search across all documentation
- 📝 **Step-by-Step Guidance**: Breaks down complex tasks into actionable steps
- 💬 **Interactive Chat Interface**: User-friendly conversational UI
- 🎯 **Context-Aware**: Understands documentation structure and relationships

## Architecture

```
doc-assistant/
├── backend/           # Node.js/Python backend
│   ├── parsers/      # DITA/XML parsers
│   ├── indexer/      # Document indexing
│   ├── ai/           # AI/LLM integration
│   └── api/          # REST API endpoints
├── frontend/         # React-based UI
│   ├── components/   # UI components
│   ├── chat/         # Chat interface
│   └── search/       # Search interface
└── data/            # Indexed documentation
```

## Technology Stack

- **Backend**: Node.js with Express
- **AI/LLM**: OpenAI API or local LLM (Ollama)
- **Vector Database**: ChromaDB or Pinecone for semantic search
- **Parser**: xml2js for DITA parsing
- **Frontend**: React with TypeScript
- **UI Framework**: Material-UI or Tailwind CSS

## Quick Start

See [SETUP.md](./SETUP.md) for detailed installation instructions.

```bash
# Install dependencies
npm install

# Index documentation
npm run index-docs

# Start the assistant
npm run dev
```

## Usage

1. **Ask Questions**: Type natural language questions about the documentation
2. **Get Step-by-Step Help**: Request detailed procedures for specific tasks
3. **Search Documentation**: Find relevant topics quickly
4. **Follow Links**: Navigate to source documentation for more details

## Configuration

Edit `config.json` to customize:
- Documentation paths
- AI model settings
- Search parameters
- UI preferences