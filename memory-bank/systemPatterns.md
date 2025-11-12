# System Patterns: NDC Packaging & Quantity Calculator

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   UI Layer      │  SvelteKit Components
│  (Components)   │
└────────┬────────┘
         │
┌────────▼────────┐
│   API Routes    │  SvelteKit API Routes
│  (+server.ts)   │
└────────┬────────┘
         │
┌────────▼────────┐
│  Service Layer  │  Business Logic
│  (Services)     │
└────────┬────────┘
         │
┌────────▼────────┐
│  External APIs  │  RxNorm, FDA
└─────────────────┘
```

### Directory Structure Pattern

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

## Key Technical Decisions

### 1. Service-Based Architecture
- **Pattern:** Separate service classes for each external API and business logic
- **Rationale:** Separation of concerns, testability, reusability
- **Implementation:**
  - `RxNormService` - Handles RxNorm API interactions
  - `FDAService` - Handles FDA NDC Directory API interactions
  - `CalculatorService` - Handles quantity calculations and package selection
  - `DrugSearchService` - Handles drug name search and autocomplete
  - `FilteringService` - Handles dosage form and strength filtering
  - `FormularyService` - Handles insurance formulary checks
  - `DrugInteractionService` - Handles drug interactions, allergies, contraindications
  - `SigParserService` - Enhanced SIG parsing with complex patterns and AI assistance

### 2. Type-First Development
- **Pattern:** Define all types before implementation
- **Rationale:** Type safety, clear contracts, better IDE support
- **Files:**
  - `drug.types.ts` - Drug and RxNorm related types
  - `ndc.types.ts` - NDC and FDA related types
  - `calculation.types.ts` - Calculation and result types

### 3. API Route Pattern
- **Pattern:** RESTful API routes in SvelteKit format
- **Endpoints:**
  - `POST /api/normalize` - Normalize drug name to RxCUI
  - `POST /api/ndc` - Get NDCs for RxCUI
  - `POST /api/calculate` - Complete calculation workflow

### 4. Component Composition
- **Pattern:** Small, focused, reusable components
- **Input Components:**
  - `DrugInputAutocomplete.svelte` - Drug name/NDC input with autocomplete
  - `SigInput.svelte` - SIG input
  - `DaysSupplyInput.svelte` - Days supply input
  - `FilterPanel.svelte` - Dosage form, strength filters, and additional checks
- **Display Components:**
  - `ResultsSummary.svelte` - Main results container
  - `NDCTable.svelte` - NDC table display
  - `QuantityDisplay.svelte` - Quantity display
  - `WarningAlerts.svelte` - Warning messages
  - `JSONOutput.svelte` - JSON output viewer

## Design Patterns in Use

### 1. Service Pattern
- Each external API has a dedicated service class
- Services handle API communication, error handling, and response parsing
- Services are testable in isolation

### 2. Utility Pattern
- Validation, formatting, and error handling in separate utility modules
- Pure functions where possible
- Comprehensive unit tests

### 3. Component Pattern
- Presentational components (display data)
- Container components (manage state and API calls)
- Reusable UI components

### 4. Error Handling Pattern
- Centralized error handling utilities
- Consistent error response format
- User-friendly error messages
- Proper HTTP status codes

## Component Relationships

### Data Flow

```
User Input → Components → API Routes → Services → External APIs
                                                      ↓
User Display ← Components ← API Routes ← Services ← Response
```

### Component Hierarchy

```
+page.svelte (Container)
├── DrugInputAutocomplete.svelte
├── SigInput.svelte
├── DaysSupplyInput.svelte
├── FilterPanel.svelte
│   ├── Dosage form filter
│   ├── Strength filter
│   └── Additional checks (insurance, interactions)
├── Insurance/Interaction fields (conditional)
├── ResultsSummary.svelte (when results available)
│   ├── QuantityDisplay.svelte
│   ├── NDCTable.svelte
│   ├── WarningAlerts.svelte
│   └── JSONOutput.svelte
└── Toast.svelte (notifications)
```

## API Integration Patterns

### RxNorm API Integration
- **Method:** HTTP requests to RxNorm API
- **Primary Endpoint:** `approximateTerm.json` (more reliable than `drugname.json`)
- **Fallback:** `drugname.json` and `spellingsuggestions.json` endpoints
- **NDC Support:** Handles NDC input directly via `getRxCUIFromNDC` method
- **Error Handling:** Retry logic, timeout handling, graceful degradation
- **Status:** ✅ Working - Successfully finds RxCUI codes for drug names and NDCs
- **Caching:** Consider caching for repeated queries (performance optimization)
- **Autocomplete:** Used by DrugSearchService for real-time drug name suggestions

### NDC Detection Pattern
- **Auto-Detection:** Calculate endpoint automatically detects NDC codes in input
- **Validation:** Supports 8-11 digit codes (was 10-11)
- **Format Support:** With/without dashes, various patterns (4-4, 5-4-1, 5-4-2, etc.)
- **Pattern Matching:** Regex patterns for NDC-like formats
- **Invalid NDC Handling:** Returns error immediately when NDC not found (no calculation)

### FDA NDC Directory API Integration
- **Method:** HTTP requests to FDA API
- **Search Strategies:** 6+ search patterns tried in order:
  1. Product NDC with dashes (original format)
  2. Package code with dashes (original format)
  3. Package code cleaned (no dashes)
  4. Product NDC cleaned (no dashes)
  5. Package NDC extraction (for 11-digit codes, extracts product NDC and searches packaging array)
  6. Padded formats (for 8-9 digit codes)
- **Product Name Parsing:** Multiple fallback fields (proprietary_name, non_proprietary_name, generic_name, brand_name, dosage_form + strength)
- **Package Size Parsing:** Enhanced regex patterns handling various formats, plural units, packaging array support
- **Error Handling:** Graceful degradation with detailed logging
- **Status:** ✅ Fully Working - All formats supported, product names and package sizes correctly extracted
- **Filtering:** Filter inactive NDCs before returning results
- **Package-Level NDC Support:** Extracts product NDC from package code and searches packaging array for matching package

## Calculation Algorithm Pattern

### Package Selection Algorithm
1. Calculate total quantity needed from SIG and days' supply
2. Filter NDCs to active only
3. Sort packages by size (or other criteria)
4. Select optimal combination:
   - Minimize number of packages
   - Minimize waste (overfill)
   - Prefer exact matches when available
5. Calculate overfill/underfill percentages
6. Generate warnings if thresholds exceeded

## Testing Patterns

### Unit Tests
- Test services in isolation with mocked API responses
- Test utilities with various input scenarios
- Test edge cases and error conditions

### Integration Tests
- Test API routes with real service calls (or mocked)
- Test complete workflows
- Test error scenarios

### E2E Tests
- Test complete user workflows
- Test with real drug names
- Test error handling from user perspective

## Performance Patterns

### Optimization Strategies
- **Debouncing:** Input debouncing for drug name search (implemented in DrugInputAutocomplete)
- **Caching:** Cache API responses for repeated queries (planned for future)
- **Lazy Loading:** Lazy load results components
- **Code Splitting:** Optimize bundle size with code splitting
- **Timeout Handling:** 2-second timeout for API calls
- **Batch Processing:** Formulary and interaction checks limited to first 5-10 NDCs for performance

## Security Patterns

### Data Handling
- Secure API communications (HTTPS)
- No storage of sensitive patient data
- Environment variables for API keys
- Rate limiting on API routes (production)

## Accessibility Patterns

### ARIA and Keyboard Navigation
- ARIA labels on all interactive elements
- Keyboard navigation support (including autocomplete dropdown)
- Screen reader compatibility
- Focus management
- Clear error announcements
- Keyboard shortcuts (Ctrl/Cmd+Enter to calculate)

## New Feature Patterns

### Drug Autocomplete Pattern
- Real-time search with 300ms debounce
- Keyboard navigation (arrow keys, Enter, Escape)
- RxNorm API integration via DrugSearchService
- Suggestion dropdown with brand/generic indicators

### Filtering Pattern
- Dosage form extraction from SIG or manual selection
- Strength extraction from drug name or manual input
- Filtering applied before calculation
- Mismatch warnings generated for filtered NDCs

### Formulary Check Pattern
- Batch checking for multiple NDCs (limited to 10 for performance)
- Coverage status, tier levels, prior authorization flags
- Warnings added to results for uncovered NDCs

### Interaction Check Pattern
- Drug-drug interaction checking (limited to 5 NDCs)
- Allergy checking against known allergens
- Contraindication checking for patient conditions
- Severity-based warning generation

### Enhanced SIG Parsing Pattern
- Rule-based parsing for common patterns
- Complex schedule support (multiple times, tapering, ranges)
- PRN medication handling with conservative estimates
- AI-assisted parsing fallback (OpenAI API) when rules fail
- Schedule-based quantity calculation

