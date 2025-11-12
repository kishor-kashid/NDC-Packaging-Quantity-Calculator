# Technical Context: NDC Packaging & Quantity Calculator

## Technologies Used

### Core Framework
- **SvelteKit** - Full-stack framework for the application
- **TypeScript** - Type-safe JavaScript with strict mode enabled
- **Vite** - Build tool and development server

### External APIs
- **RxNorm API** - Drug name normalization to RxCUI
  - Purpose: Convert drug names (brand/generic) to standardized RxCUI codes
  - Authentication: To be determined during implementation
  - Documentation: https://www.nlm.nih.gov/research/umls/rxnorm/overview.html

- **FDA NDC Directory API** - NDC and packaging information
  - Purpose: Retrieve NDC codes, package sizes, and active/inactive status
  - Authentication: To be determined during implementation
  - Documentation: https://www.fda.gov/drugs/drug-approvals-and-databases/national-drug-code-directory

- **OpenAI API** - AI functionalities (future enhancement)
  - Purpose: AI-accelerated features (specific use cases to be determined)
  - Status: Mentioned in PRD but not detailed in initial requirements

### Cloud Platform
- **Google Cloud Platform (GCP)** - Deployment and hosting
  - Specific services: To be determined (Cloud Run, App Engine, etc.)
  - Status: Planned for production deployment

## Development Setup

### Prerequisites
- Node.js (version to be determined during setup)
- npm/yarn/pnpm (package manager to be determined)
- Git for version control

### Project Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration (strict mode)
- `svelte.config.js` - SvelteKit configuration
- `vite.config.ts` - Vite build configuration
- `.gitignore` - Git ignore patterns

### Development Scripts (Expected)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Lint code

## Technical Constraints

### Performance Requirements
- **Response Time:** <2 seconds per query (non-functional requirement) - ✅ Achieved
- **Scalability:** Support concurrent usage by multiple users - ✅ Basic support implemented
- **Optimization:** Implement caching, debouncing, and code splitting - ⚠️ Caching not yet implemented (planned for future)

### Security Requirements
- Secure data handling and API communications
- Environment variables for sensitive data (API keys)
- HTTPS for all API communications
- Rate limiting for API routes (production)

### Compliance Requirements
- Adhere to relevant healthcare regulations
- Data protection standards compliance
- No storage of sensitive patient data

## Dependencies

### Core Dependencies (Expected)
- `@sveltejs/kit` - SvelteKit framework
- `svelte` - Svelte framework
- `typescript` - TypeScript compiler
- `vite` - Build tool

### Development Dependencies (Expected)
- `@types/node` - Node.js type definitions
- Testing framework (to be determined - Vitest likely)
- Linting tools (ESLint, Prettier potentially)

### External API Dependencies
- HTTP client library (fetch API or axios)
- May need specific SDKs for RxNorm or FDA APIs

## Data Formats

### Input Formats
- **Drug Name:** String (brand or generic name)
- **NDC:** String (8-11 digit NDC code, with or without dashes)
  - 8 digits: 4-4 format (product NDC, e.g., `0591-0885`)
  - 9 digits: 4-4-1 format
  - 10 digits: 5-4-1 format (product NDC, e.g., `68180-981`)
  - 11 digits: 5-4-2 format (package NDC, e.g., `68180-981-01`)
- **SIG:** String (natural language dosing instructions)
- **Days Supply:** Number (integer)

### Output Formats
- **JSON:** Structured JSON response with:
  - Calculated quantity
  - Recommended NDCs
  - Package information
  - Warnings and alerts
- **UI Display:** Formatted results in Svelte components

## API Response Structures (Expected)

### RxNorm API Response
- RxCUI code
- Drug name variations
- Related concepts

### FDA NDC Directory API Response
- NDC codes
- Package sizes
- Active/inactive status
- Manufacturer information
- Dosage form

### Internal API Responses
- Standardized format across all endpoints
- Error responses with proper HTTP status codes
- Success responses with structured data

## Build and Deployment

### Build Process
- TypeScript compilation
- Svelte component compilation
- Asset optimization
- Code splitting and bundling

### Deployment Target
- **Platform:** Google Cloud Platform (GCP)
- **Method:** To be determined (Cloud Run, App Engine, etc.)
- **Environment Variables:** Required for API keys and configuration

## Development Workflow

### Branch Strategy
- Feature branches: `feature/feature-name`
- Each PR corresponds to a feature branch
- Main/master branch for production-ready code

### Testing Strategy
- Unit tests for services and utilities
- Integration tests for API routes
- E2E tests for complete workflows
- Manual testing for UI and accessibility

### Code Quality
- TypeScript strict mode
- Consistent code formatting
- Meaningful commit messages
- Code review before merging

## Environment Variables (Expected)

### Development
- `RXNORM_API_KEY` - RxNorm API authentication
- `FDA_API_KEY` - FDA API authentication (if required)
- `OPENAI_API_KEY` - OpenAI API key (if used)

### Production
- Same as development plus:
- `NODE_ENV=production`
- Additional GCP configuration variables

## Browser Support

### Target Platforms
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Tablet devices (iPad, Android tablets)
- Mobile devices (responsive design)

### Accessibility
- Screen reader compatibility
- Keyboard navigation
- ARIA labels and roles
- Focus management

## Known Technical Challenges

1. ✅ **API Rate Limits** - Handled with timeout and retry logic, graceful degradation
2. ✅ **SIG Parsing** - Working correctly with regex patterns for common formats
3. ✅ **Package Selection Algorithm** - Optimizing package combinations implemented
4. ✅ **Performance** - Meeting <2 second requirement (verified in testing)
5. ✅ **Error Handling** - Comprehensive error handling implemented
6. ✅ **NDC Format Variations** - All formats (8-11 digits, with/without dashes) now supported
7. ✅ **FDA API Response Parsing** - Product names and package sizes correctly extracted
8. ✅ **Package-Level NDC Lookup** - Extracts product NDC and searches packaging array
9. ⚠️ **API Response Caching** - Not yet implemented (planned for performance optimization)

