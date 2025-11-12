# NDC Packaging & Quantity Calculator

**Organization:** Foundation Health  
**Project ID:** hnCCiUa1F2Q7UU8GBlCe_1762540939252

## Overview

The **NDC Packaging & Quantity Calculator** is an AI-accelerated tool designed to enhance the accuracy of prescription fulfillment in pharmacy systems. It matches prescriptions with valid National Drug Codes (NDCs) and calculates correct dispense quantities to reduce claim rejections and improve patient satisfaction.

## Problem Statement

Pharmacy systems frequently encounter challenges in accurately matching prescriptions to valid NDCs and determining correct dispense quantities. This tool addresses:
- Dosage form mismatches
- Package size errors
- Inactive NDCs
- Manual calculation errors

## Key Features

### Core Features
- **Drug Normalization**: Converts drug names (brand/generic) to standardized RxCUI codes using RxNorm API
- **NDC Retrieval**: Fetches valid NDCs and package information from FDA NDC Directory API
- **Quantity Calculation**: Calculates dispense quantities from SIG (dosing instructions) and days' supply
- **Package Selection**: Selects optimal NDC packages to minimize waste
- **Warning System**: Flags inactive NDCs and overfill/underfill situations

### Advanced Features
- **Drug Name Autocomplete**: Real-time drug name suggestions with RxNorm integration
- **Dosage Form Filtering**: Filter NDCs by dosage form (tablet, capsule, liquid, etc.) with mismatch warnings
- **Strength Matching**: Filter by drug strength and warn on mismatches
- **Insurance Formulary Integration**: Check coverage, tier levels, and prior authorization requirements
- **Drug Interaction Warnings**: Check for drug-drug interactions, allergies, and contraindications
- **Enhanced SIG Parsing**: Support for complex patterns:
  - Dose ranges (e.g., "Take 1-2 tablets as needed")
  - Multiple times (e.g., "Take 1 tablet in the morning and 1 at bedtime")
  - Tapering schedules (e.g., "Take 2 tablets on day 1, then 1 tablet daily")
  - PRN medications with conservative estimates
  - AI-assisted parsing for complex cases (optional OpenAI API)

## Technology Stack

- **Framework**: SvelteKit
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **APIs**: RxNorm API, FDA NDC Directory API
- **Platform**: Google Cloud Platform (GCP)

## Project Structure

```
src/
├── routes/           # SvelteKit routes and API endpoints
│   ├── +page.svelte  # Main UI page
│   ├── +page.ts      # Page load function
│   └── api/          # API route handlers
├── lib/
│   ├── types/        # TypeScript type definitions
│   ├── services/     # Business logic services
│   ├── utils/        # Utility functions
│   └── components/   # Reusable Svelte components
└── tests/            # Test files
    ├── unit/         # Unit tests
    ├── integration/  # Integration tests
    └── e2e/          # End-to-end tests
```

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js) or **yarn**
- **Git** for version control

### Installation

1. Clone the repository (if applicable):
```bash
git clone <repository-url>
cd NDC-Packaging-Quantity-Calculator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (create `.env` file):
```bash
# Copy example if available, or create new .env file
# Add your API keys:
# RXNORM_API_KEY=your_key_here
# FDA_API_KEY=your_key_here (if required)
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

The application will automatically reload when you make changes to the source files.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run check` - Run TypeScript and Svelte type checking
- `npm run check:watch` - Run type checking in watch mode

### Type Checking

```bash
npm run check
```

### Watch Mode

```bash
npm run check:watch
```

### Project Status

**Current Phase:** Production Ready - All Core Features Complete + Advanced Features Implemented  
**Overall Progress:** ~99%  
**Latest Completed:** All 18 PRs Complete ✅ + Advanced Features ✅

**Recent Updates:**
- ✅ All core features implemented and tested
- ✅ Advanced features (autocomplete, filtering, formulary, interactions, enhanced SIG parsing)
- ✅ Professional UI with modern design, animations, and improved visual hierarchy
- ✅ Comprehensive browser testing completed
- ✅ Complete API documentation created
- ⚠️ Minor bugs: Tapering schedule calculation, duplicate warnings (to be fixed)

See [Task List](./NDC-Calculator-Task-List.md) for detailed progress and [API Documentation](./API.md) for complete API reference.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# RxNorm API Configuration
RXNORM_API_KEY=your_rxnorm_api_key_here

# FDA NDC Directory API Configuration (if required)
FDA_API_KEY=your_fda_api_key_here

# OpenAI API (for future AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Node Environment
NODE_ENV=development
```

**Note:** Never commit `.env` files to version control. The `.gitignore` file is configured to exclude them.

## Success Metrics

- **Accuracy**: 95%+ medication normalization accuracy
- **Performance**: <2 seconds per query
- **User Satisfaction**: 4.5/5+ rating
- **Error Reduction**: 50% reduction in NDC-related claim rejections

## Target Users

- **Primary**: Pharmacists and Pharmacy Technicians
- **Secondary**: Healthcare Administrators

## Project Structure

The project follows a modular architecture:

- **`src/routes/`** - SvelteKit file-based routing
  - `+page.svelte` - Page components
  - `+page.ts` - Page load functions
  - `api/` - API route handlers

- **`src/lib/`** - Reusable application code
  - `types/` - TypeScript type definitions
  - `services/` - Business logic and API integrations
  - `utils/` - Utility functions
  - `components/` - Reusable Svelte components

- **`src/tests/`** - Test files
  - `unit/` - Unit tests
  - `integration/` - Integration tests
  - `e2e/` - End-to-end tests

- **`static/`** - Static assets (images, favicon, etc.)

## API Integration

This application integrates with external APIs:

- **RxNorm API** - For drug name normalization and autocomplete
- **FDA NDC Directory API** - For NDC and packaging information
- **OpenAI API** (Optional) - For AI-assisted SIG parsing

See [API Documentation](./API.md) for complete API reference and [Memory Bank](./memory-bank/techContext.md) for detailed setup instructions.

## Documentation

- [API Documentation](./API.md) - Complete API reference with endpoints, request/response formats
- [Product Requirements Document](./PRD_Foundation_Health_NDC_Packaging_Quantity_Calculator.md) - Complete project requirements
- [Quick Start Guide](./QUICK_START.md) - Get started quickly with sample data
- [Sample Data](./SAMPLE_DATA.md) - Test data and examples
- [Task List](./NDC-Calculator-Task-List.md) - Detailed development plan with 18 PRs
- [Memory Bank](./memory-bank/) - Project context, architecture, and technical documentation
  - [Project Brief](./memory-bank/projectbrief.md) - Core purpose and goals
  - [Product Context](./memory-bank/productContext.md) - User needs and problems solved
  - [System Patterns](./memory-bank/systemPatterns.md) - Architecture and design patterns
  - [Technical Context](./memory-bank/techContext.md) - Technologies and setup
  - [Active Context](./memory-bank/activeContext.md) - Current work and next steps
  - [Progress](./memory-bank/progress.md) - Development status

## Contributing

This project follows a structured development approach with pull requests. See the [Task List](./NDC-Calculator-Task-List.md) for the complete development plan.

### Code Standards

- TypeScript strict mode enabled
- Follow patterns defined in `.cursor/rules/`
- Write tests for all new features
- Document public APIs with JSDoc
- Follow SvelteKit conventions

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors:**
- Run `npm run check` to see detailed error messages
- Ensure all types are properly defined

**Development server won't start:**
- Check that Node.js version is v18 or higher
- Delete `node_modules` and `.svelte-kit` directories, then run `npm install` again

**API calls failing:**
- Verify environment variables are set correctly in `.env` file
- Check API key validity and rate limits

## License

[To be determined]
