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
  - `DrugInput.svelte` - Drug name/NDC input
  - `SigInput.svelte` - SIG input
  - `DaysSupplyInput.svelte` - Days supply input
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
├── DrugInput.svelte
├── SigInput.svelte
├── DaysSupplyInput.svelte
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
- **Error Handling:** Retry logic, timeout handling, graceful degradation
- **Status:** ✅ Working - Successfully finds RxCUI codes for drug names
- **Caching:** Consider caching for repeated queries (performance optimization)

### FDA NDC Directory API Integration
- **Method:** HTTP requests to FDA API
- **Search Patterns:** Multiple fallback patterns (proprietary_name, non_proprietary_name, brand_name, generic_name)
- **Error Handling:** Graceful degradation - returns empty arrays instead of throwing errors
- **Status:** ✅ Working - Successfully retrieves NDCs, but product name/package size parsing needs improvement
- **Filtering:** Filter inactive NDCs before returning results
- **Known Issue:** Product names and package sizes not parsing correctly from FDA responses

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
- **Debouncing:** Input debouncing for drug name search
- **Caching:** Cache API responses for repeated queries
- **Lazy Loading:** Lazy load results components
- **Code Splitting:** Optimize bundle size with code splitting
- **Timeout Handling:** 2-second timeout for API calls

## Security Patterns

### Data Handling
- Secure API communications (HTTPS)
- No storage of sensitive patient data
- Environment variables for API keys
- Rate limiting on API routes (production)

## Accessibility Patterns

### ARIA and Keyboard Navigation
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Clear error announcements

