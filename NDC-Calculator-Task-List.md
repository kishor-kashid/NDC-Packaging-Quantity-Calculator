# NDC Packaging & Quantity Calculator - Task List

**Project ID:** hnCCiUa1F2Q7UU8GBlCe_1762540939252  
**Organization:** Foundation Health

---

## Project File Structure

```
ndc-calculator/
├── .gitignore
├── package.json
├── tsconfig.json
├── svelte.config.js
├── vite.config.ts
├── README.md
├── src/
│   ├── app.html
│   ├── app.css
│   ├── routes/
│   │   ├── +page.svelte
│   │   ├── +page.ts
│   │   ├── +layout.svelte
│   │   └── api/
│   │       ├── normalize/
│   │       │   └── +server.ts
│   │       ├── ndc/
│   │       │   └── +server.ts
│   │       └── calculate/
│   │           └── +server.ts
│   ├── lib/
│   │   ├── types/
│   │   │   ├── drug.types.ts
│   │   │   ├── ndc.types.ts
│   │   │   └── calculation.types.ts
│   │   ├── services/
│   │   │   ├── rxnorm.service.ts
│   │   │   ├── fda.service.ts
│   │   │   └── calculator.service.ts
│   │   ├── utils/
│   │   │   ├── validation.utils.ts
│   │   │   ├── formatting.utils.ts
│   │   │   └── error-handler.utils.ts
│   │   └── components/
│   │       ├── DrugInput.svelte
│   │       ├── SigInput.svelte
│   │       ├── ResultsSummary.svelte
│   │       ├── NDCTable.svelte
│   │       ├── WarningAlerts.svelte
│   │       ├── QuantityDisplay.svelte
│   │       └── JSONOutput.svelte
│   └── tests/
│       ├── unit/
│       │   ├── services/
│       │   │   ├── rxnorm.service.test.ts
│       │   │   ├── fda.service.test.ts
│       │   │   └── calculator.service.test.ts
│       │   └── utils/
│       │       ├── validation.utils.test.ts
│       │       └── formatting.utils.test.ts
│       └── integration/
│           └── api/
│               ├── normalize.test.ts
│               ├── ndc.test.ts
│               └── calculate.test.ts
└── static/
    └── favicon.png
```

---

## PR Breakdown & Task Checklist

### **PR #1: Project Setup & Configuration**
**Branch:** `feature/project-setup`  
**Description:** Initialize SvelteKit project with TypeScript and base configuration

#### Tasks:
- [ ] Initialize SvelteKit project with TypeScript template
  - **Files Created:** `package.json`, `svelte.config.js`, `vite.config.ts`, `tsconfig.json`
- [ ] Configure TypeScript settings for strict mode
  - **Files Modified:** `tsconfig.json`
- [ ] Set up project structure (folders: routes, lib, components, services, utils, types)
  - **Files Created:** All directory structure from above
- [ ] Create `.gitignore` file
  - **Files Created:** `.gitignore`
- [ ] Install core dependencies (SvelteKit, TypeScript, Vite)
  - **Files Modified:** `package.json`
- [ ] Create initial `README.md` with project overview
  - **Files Created:** `README.md`
- [ ] Set up basic layout component
  - **Files Created:** `src/routes/+layout.svelte`
- [ ] Create placeholder home page
  - **Files Created:** `src/routes/+page.svelte`
- [ ] Verify local development server runs successfully
- [ ] Initial commit and push to GitHub

**Files Modified/Created:**
- `package.json`
- `tsconfig.json`
- `svelte.config.js`
- `vite.config.ts`
- `.gitignore`
- `README.md`
- `src/routes/+layout.svelte`
- `src/routes/+page.svelte`
- `src/app.html`

---

### **PR #2: TypeScript Type Definitions**
**Branch:** `feature/type-definitions`  
**Description:** Create all TypeScript interfaces and types for the application

#### Tasks:
- [ ] Define drug-related types (DrugInput, RxCUI, RxNormResponse)
  - **Files Created:** `src/lib/types/drug.types.ts`
- [ ] Define NDC-related types (NDC, PackageInfo, NDCResponse, FDAResponse)
  - **Files Created:** `src/lib/types/ndc.types.ts`
- [ ] Define calculation types (CalculationInput, CalculationResult, DispenseRecommendation)
  - **Files Created:** `src/lib/types/calculation.types.ts`
- [ ] Create shared utility types (APIResponse, ErrorResponse, ValidationError)
  - **Files Modified:** `src/lib/types/drug.types.ts`, `src/lib/types/ndc.types.ts`
- [ ] Document all types with JSDoc comments
- [ ] Export all types from index file for easy importing
  - **Files Created:** `src/lib/types/index.ts`

**Files Modified/Created:**
- `src/lib/types/drug.types.ts`
- `src/lib/types/ndc.types.ts`
- `src/lib/types/calculation.types.ts`
- `src/lib/types/index.ts`

---

### **PR #3: Utility Functions & Validation**
**Branch:** `feature/utilities`  
**Description:** Implement validation, formatting, and error handling utilities

#### Tasks:
- [ ] Create input validation functions (validateDrugName, validateNDC, validateSIG, validateDaysSupply)
  - **Files Created:** `src/lib/utils/validation.utils.ts`
- [ ] Implement formatting utilities (formatNDC, formatQuantity, formatDate)
  - **Files Created:** `src/lib/utils/formatting.utils.ts`
- [ ] Build error handling utilities (handleAPIError, createErrorResponse)
  - **Files Created:** `src/lib/utils/error-handler.utils.ts`
- [ ] Add unit tests for validation functions
  - **Files Created:** `src/tests/unit/utils/validation.utils.test.ts`
- [ ] Add unit tests for formatting functions
  - **Files Created:** `src/tests/unit/utils/formatting.utils.test.ts`
- [ ] Export all utilities from index
  - **Files Created:** `src/lib/utils/index.ts`

**Files Modified/Created:**
- `src/lib/utils/validation.utils.ts`
- `src/lib/utils/formatting.utils.ts`
- `src/lib/utils/error-handler.utils.ts`
- `src/lib/utils/index.ts`
- `src/tests/unit/utils/validation.utils.test.ts`
- `src/tests/unit/utils/formatting.utils.test.ts`

---

### **PR #4: RxNorm API Service**
**Branch:** `feature/rxnorm-service`  
**Description:** Implement RxNorm API integration for drug normalization

#### Tasks:
- [ ] Create RxNorm service class with base configuration
  - **Files Created:** `src/lib/services/rxnorm.service.ts`
- [ ] Implement `getRxCUI()` method to normalize drug names
  - **Files Modified:** `src/lib/services/rxnorm.service.ts`
- [ ] Implement `getNDCsForRxCUI()` method to get NDCs
  - **Files Modified:** `src/lib/services/rxnorm.service.ts`
- [ ] Add error handling and retry logic
  - **Files Modified:** `src/lib/services/rxnorm.service.ts`
- [ ] Add request timeout handling
  - **Files Modified:** `src/lib/services/rxnorm.service.ts`
- [ ] Create unit tests for RxNorm service
  - **Files Created:** `src/tests/unit/services/rxnorm.service.test.ts`
- [ ] Add JSDoc documentation for all methods
  - **Files Modified:** `src/lib/services/rxnorm.service.ts`

**Files Modified/Created:**
- `src/lib/services/rxnorm.service.ts`
- `src/tests/unit/services/rxnorm.service.test.ts`

---

### **PR #5: FDA NDC Directory API Service**
**Branch:** `feature/fda-service`  
**Description:** Implement FDA NDC Directory API integration

#### Tasks:
- [ ] Create FDA service class with base configuration
  - **Files Created:** `src/lib/services/fda.service.ts`
- [ ] Implement `getNDCDetails()` method to fetch NDC information
  - **Files Modified:** `src/lib/services/fda.service.ts`
- [ ] Implement `getPackagingInfo()` method to retrieve package sizes
  - **Files Modified:** `src/lib/services/fda.service.ts`
- [ ] Implement `checkNDCStatus()` method to verify active/inactive status
  - **Files Modified:** `src/lib/services/fda.service.ts`
- [ ] Add error handling for API rate limits
  - **Files Modified:** `src/lib/services/fda.service.ts`
- [ ] Parse and normalize FDA API responses
  - **Files Modified:** `src/lib/services/fda.service.ts`
- [ ] Create unit tests for FDA service
  - **Files Created:** `src/tests/unit/services/fda.service.test.ts`
- [ ] Add JSDoc documentation
  - **Files Modified:** `src/lib/services/fda.service.ts`

**Files Modified/Created:**
- `src/lib/services/fda.service.ts`
- `src/tests/unit/services/fda.service.test.ts`

---

### **PR #6: Quantity Calculator Service**
**Branch:** `feature/calculator-service`  
**Description:** Implement core calculation logic for dispense quantities

#### Tasks:
- [ ] Create Calculator service class
  - **Files Created:** `src/lib/services/calculator.service.ts`
- [ ] Implement SIG parsing logic (extract dose, frequency, units)
  - **Files Modified:** `src/lib/services/calculator.service.ts`
- [ ] Implement `calculateTotalQuantity()` method
  - **Files Modified:** `src/lib/services/calculator.service.ts`
- [ ] Implement `selectOptimalPackages()` algorithm
  - **Files Modified:** `src/lib/services/calculator.service.ts`
- [ ] Implement overfill/underfill detection logic
  - **Files Modified:** `src/lib/services/calculator.service.ts`
- [ ] Handle special cases (liquids, inhalers, insulin)
  - **Files Modified:** `src/lib/services/calculator.service.ts`
- [ ] Create unit tests for calculator service
  - **Files Created:** `src/tests/unit/services/calculator.service.test.ts`
- [ ] Test edge cases (zero quantities, invalid SIGs, multi-packs)
  - **Files Modified:** `src/tests/unit/services/calculator.service.test.ts`
- [ ] Add comprehensive JSDoc documentation
  - **Files Modified:** `src/lib/services/calculator.service.ts`

**Files Modified/Created:**
- `src/lib/services/calculator.service.ts`
- `src/tests/unit/services/calculator.service.test.ts`

---

### **PR #7: API Routes - Normalize Endpoint**
**Branch:** `feature/api-normalize`  
**Description:** Create API endpoint for drug name normalization

#### Tasks:
- [ ] Create normalize API route handler
  - **Files Created:** `src/routes/api/normalize/+server.ts`
- [ ] Implement POST request handling
  - **Files Modified:** `src/routes/api/normalize/+server.ts`
- [ ] Integrate RxNorm service
  - **Files Modified:** `src/routes/api/normalize/+server.ts`
- [ ] Add input validation
  - **Files Modified:** `src/routes/api/normalize/+server.ts`
- [ ] Implement error responses with proper HTTP status codes
  - **Files Modified:** `src/routes/api/normalize/+server.ts`
- [ ] Add request/response logging
  - **Files Modified:** `src/routes/api/normalize/+server.ts`
- [ ] Create integration tests for normalize endpoint
  - **Files Created:** `src/tests/integration/api/normalize.test.ts`
- [ ] Test with various drug names (brand, generic, misspellings)
  - **Files Modified:** `src/tests/integration/api/normalize.test.ts`

**Files Modified/Created:**
- `src/routes/api/normalize/+server.ts`
- `src/tests/integration/api/normalize.test.ts`

---

### **PR #8: API Routes - NDC Endpoint**
**Branch:** `feature/api-ndc`  
**Description:** Create API endpoint for NDC retrieval and validation

#### Tasks:
- [ ] Create NDC API route handler
  - **Files Created:** `src/routes/api/ndc/+server.ts`
- [ ] Implement POST request handling
  - **Files Modified:** `src/routes/api/ndc/+server.ts`
- [ ] Integrate FDA service
  - **Files Modified:** `src/routes/api/ndc/+server.ts`
- [ ] Filter and return only active NDCs
  - **Files Modified:** `src/routes/api/ndc/+server.ts`
- [ ] Include packaging information in response
  - **Files Modified:** `src/routes/api/ndc/+server.ts`
- [ ] Add input validation for RxCUI
  - **Files Modified:** `src/routes/api/ndc/+server.ts`
- [ ] Implement error handling
  - **Files Modified:** `src/routes/api/ndc/+server.ts`
- [ ] Create integration tests for NDC endpoint
  - **Files Created:** `src/tests/integration/api/ndc.test.ts`

**Files Modified/Created:**
- `src/routes/api/ndc/+server.ts`
- `src/tests/integration/api/ndc.test.ts`

---

### **PR #9: API Routes - Calculate Endpoint**
**Branch:** `feature/api-calculate`  
**Description:** Create API endpoint for quantity calculation

#### Tasks:
- [ ] Create calculate API route handler
  - **Files Created:** `src/routes/api/calculate/+server.ts`
- [ ] Implement POST request handling
  - **Files Modified:** `src/routes/api/calculate/+server.ts`
- [ ] Integrate Calculator service
  - **Files Modified:** `src/routes/api/calculate/+server.ts`
- [ ] Orchestrate complete workflow (normalize → NDCs → calculate)
  - **Files Modified:** `src/routes/api/calculate/+server.ts`
- [ ] Format response with recommendations and warnings
  - **Files Modified:** `src/routes/api/calculate/+server.ts`
- [ ] Include JSON output in response
  - **Files Modified:** `src/routes/api/calculate/+server.ts`
- [ ] Add comprehensive error handling
  - **Files Modified:** `src/routes/api/calculate/+server.ts`
- [ ] Create integration tests for calculate endpoint
  - **Files Created:** `src/tests/integration/api/calculate.test.ts`
- [ ] Test end-to-end scenarios
  - **Files Modified:** `src/tests/integration/api/calculate.test.ts`

**Files Modified/Created:**
- `src/routes/api/calculate/+server.ts`
- `src/tests/integration/api/calculate.test.ts`

---

### **PR #10: UI Components - Input Forms**
**Branch:** `feature/ui-input-components`  
**Description:** Build reusable input components for drug information

#### Tasks:
- [ ] Create DrugInput component (text input with validation)
  - **Files Created:** `src/lib/components/DrugInput.svelte`
- [ ] Add auto-complete suggestions for drug names
  - **Files Modified:** `src/lib/components/DrugInput.svelte`
- [ ] Create SigInput component (dosing instructions input)
  - **Files Created:** `src/lib/components/SigInput.svelte`
- [ ] Add SIG examples and helper text
  - **Files Modified:** `src/lib/components/SigInput.svelte`
- [ ] Create DaysSupplyInput component (numeric input)
  - **Files Created:** `src/lib/components/DaysSupplyInput.svelte`
- [ ] Add input validation UI feedback (error states)
  - **Files Modified:** All input components
- [ ] Implement accessibility features (ARIA labels, keyboard navigation)
  - **Files Modified:** All input components
- [ ] Style components with responsive design
  - **Files Modified:** All input components

**Files Modified/Created:**
- `src/lib/components/DrugInput.svelte`
- `src/lib/components/SigInput.svelte`
- `src/lib/components/DaysSupplyInput.svelte`

---

### **PR #11: UI Components - Results Display**
**Branch:** `feature/ui-results-components`  
**Description:** Build components to display calculation results

#### Tasks:
- [ ] Create ResultsSummary component (main results container)
  - **Files Created:** `src/lib/components/ResultsSummary.svelte`
- [ ] Create NDCTable component (display available NDCs)
  - **Files Created:** `src/lib/components/NDCTable.svelte`
- [ ] Add sortable columns to NDC table
  - **Files Modified:** `src/lib/components/NDCTable.svelte`
- [ ] Highlight inactive NDCs in table
  - **Files Modified:** `src/lib/components/NDCTable.svelte`
- [ ] Create QuantityDisplay component (show dispense quantity)
  - **Files Created:** `src/lib/components/QuantityDisplay.svelte`
- [ ] Create WarningAlerts component (overfill/underfill warnings)
  - **Files Created:** `src/lib/components/WarningAlerts.svelte`
- [ ] Create JSONOutput component (collapsible JSON viewer)
  - **Files Created:** `src/lib/components/JSONOutput.svelte`
- [ ] Add copy-to-clipboard functionality for JSON
  - **Files Modified:** `src/lib/components/JSONOutput.svelte`
- [ ] Style all results components with clear visual hierarchy
  - **Files Modified:** All results components

**Files Modified/Created:**
- `src/lib/components/ResultsSummary.svelte`
- `src/lib/components/NDCTable.svelte`
- `src/lib/components/QuantityDisplay.svelte`
- `src/lib/components/WarningAlerts.svelte`
- `src/lib/components/JSONOutput.svelte`

---

### **PR #12: Main Application Integration**
**Branch:** `feature/main-page-integration`  
**Description:** Integrate all components into main application page

#### Tasks:
- [ ] Update main page layout
  - **Files Modified:** `src/routes/+page.svelte`
- [ ] Import and place all input components
  - **Files Modified:** `src/routes/+page.svelte`
- [ ] Implement form submission logic
  - **Files Modified:** `src/routes/+page.svelte`, `src/routes/+page.ts`
- [ ] Connect to calculate API endpoint
  - **Files Modified:** `src/routes/+page.ts`
- [ ] Handle loading states during API calls
  - **Files Modified:** `src/routes/+page.svelte`
- [ ] Display results using results components
  - **Files Modified:** `src/routes/+page.svelte`
- [ ] Implement error handling and display
  - **Files Modified:** `src/routes/+page.svelte`
- [ ] Add "Calculate" and "Clear" buttons
  - **Files Modified:** `src/routes/+page.svelte`
- [ ] Test complete user workflow locally
- [ ] Add page-level accessibility features

**Files Modified/Created:**
- `src/routes/+page.svelte`
- `src/routes/+page.ts`

---

### **PR #13: Styling & Responsive Design**
**Branch:** `feature/styling`  
**Description:** Apply consistent styling and ensure responsive design

#### Tasks:
- [ ] Create global CSS variables for theme (colors, spacing, fonts)
  - **Files Modified:** `src/app.css`
- [ ] Style main layout and navigation
  - **Files Modified:** `src/routes/+layout.svelte`
- [ ] Ensure mobile responsiveness (breakpoints: 320px, 768px, 1024px)
  - **Files Modified:** `src/app.css`, component files
- [ ] Add tablet-specific layouts
  - **Files Modified:** Component files
- [ ] Style form inputs with consistent appearance
  - **Files Modified:** Input component files
- [ ] Style results display with clear visual hierarchy
  - **Files Modified:** Results component files
- [ ] Add loading spinners and transitions
  - **Files Modified:** `src/routes/+page.svelte`
- [ ] Implement focus states for accessibility
  - **Files Modified:** All interactive components
- [ ] Test on multiple screen sizes and devices
- [ ] Add Foundation Health branding (colors, logo)
  - **Files Modified:** `src/app.css`, `src/routes/+layout.svelte`

**Files Modified/Created:**
- `src/app.css`
- `src/routes/+layout.svelte`
- All component files

---

### **PR #14: Error Handling & User Feedback**
**Branch:** `feature/error-handling`  
**Description:** Implement comprehensive error handling and user feedback

#### Tasks:
- [ ] Create Toast/notification component for messages
  - **Files Created:** `src/lib/components/Toast.svelte`
- [ ] Add error boundary handling
  - **Files Modified:** `src/routes/+layout.svelte`
- [ ] Implement user-friendly error messages
  - **Files Modified:** `src/lib/utils/error-handler.utils.ts`
- [ ] Add specific error handling for API failures
  - **Files Modified:** API route files
- [ ] Show network error messages
  - **Files Modified:** `src/routes/+page.svelte`
- [ ] Add validation error messages on inputs
  - **Files Modified:** Input component files
- [ ] Implement success messages after calculations
  - **Files Modified:** `src/routes/+page.svelte`
- [ ] Add informational tooltips for complex fields
  - **Files Modified:** Input component files
- [ ] Test error scenarios (network failures, invalid inputs, API errors)

**Files Modified/Created:**
- `src/lib/components/Toast.svelte`
- `src/routes/+layout.svelte`
- `src/lib/utils/error-handler.utils.ts`
- All API route files
- `src/routes/+page.svelte`
- Input component files

---

### **PR #15: Performance Optimization**
**Branch:** `feature/performance`  
**Description:** Optimize application performance

#### Tasks:
- [ ] Implement debouncing for drug name input
  - **Files Modified:** `src/lib/components/DrugInput.svelte`
- [ ] Add request caching for repeated queries
  - **Files Modified:** Service files
- [ ] Optimize component re-renders
  - **Files Modified:** Component files
- [ ] Lazy load results components
  - **Files Modified:** `src/routes/+page.svelte`
- [ ] Compress API responses
  - **Files Modified:** API route files
- [ ] Add timeout handling for slow APIs (2 second threshold)
  - **Files Modified:** Service files
- [ ] Optimize bundle size (code splitting)
  - **Files Modified:** `vite.config.ts`
- [ ] Test performance with Chrome DevTools
- [ ] Ensure sub-2-second response time for queries

**Files Modified/Created:**
- `src/lib/components/DrugInput.svelte`
- Service files
- Component files
- `src/routes/+page.svelte`
- API route files
- `vite.config.ts`

---

### **PR #16: Testing & Quality Assurance**
**Branch:** `feature/testing-qa`  
**Description:** Comprehensive testing and quality assurance

#### Tasks:
- [ ] Write end-to-end tests for complete workflows
  - **Files Created:** `src/tests/e2e/calculator.test.ts`
- [ ] Test with real drug names (common medications)
  - **Files Modified:** Test files
- [ ] Test edge cases (unusual SIGs, large quantities)
  - **Files Modified:** Test files
- [ ] Test error scenarios
  - **Files Modified:** Test files
- [ ] Verify accessibility with screen readers
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile device testing
- [ ] Validate API response formats
  - **Files Modified:** Integration test files
- [ ] Code review and refactoring
  - **Files Modified:** Various files as needed
- [ ] Fix any bugs discovered during testing
  - **Files Modified:** Various files as needed

**Files Modified/Created:**
- `src/tests/e2e/calculator.test.ts`
- All test files
- Various source files for bug fixes

---

### **PR #17: Documentation & README**
**Branch:** `feature/documentation`  
**Description:** Complete project documentation

#### Tasks:
- [ ] Update README with project description
  - **Files Modified:** `README.md`
- [ ] Add installation instructions
  - **Files Modified:** `README.md`
- [ ] Document API endpoints with examples
  - **Files Modified:** `README.md`
- [ ] Add usage guide with screenshots
  - **Files Modified:** `README.md`
- [ ] Document component props and usage
  - **Files Created:** Component documentation files
- [ ] Add code comments for complex logic
  - **Files Modified:** Service and utility files
- [ ] Create developer setup guide
  - **Files Modified:** `README.md`
- [ ] Document environment variables (if any)
  - **Files Modified:** `README.md`
- [ ] Add troubleshooting section
  - **Files Modified:** `README.md`
- [ ] Include license information
  - **Files Created:** `LICENSE`

**Files Modified/Created:**
- `README.md`
- `LICENSE`
- Component documentation files
- Service and utility files

---

### **PR #18: Final Polish & Production Readiness**
**Branch:** `feature/production-ready`  
**Description:** Final preparations for production deployment

#### Tasks:
- [ ] Remove console.log statements
  - **Files Modified:** All source files
- [ ] Add production environment configuration
  - **Files Modified:** `vite.config.ts`
- [ ] Optimize assets (compress images, minify CSS)
  - **Files Modified:** `vite.config.ts`, static files
- [ ] Add security headers
  - **Files Modified:** `svelte.config.js`
- [ ] Implement rate limiting for API routes
  - **Files Modified:** API route files
- [ ] Add analytics/monitoring hooks (optional)
  - **Files Modified:** `src/routes/+layout.svelte`
- [ ] Final code review and cleanup
  - **Files Modified:** Various files
- [ ] Update version number
  - **Files Modified:** `package.json`
- [ ] Create production build and test
- [ ] Tag release version in Git

**Files Modified/Created:**
- All source files (cleanup)
- `vite.config.ts`
- `svelte.config.js`
- API route files
- `src/routes/+layout.svelte`
- `package.json`

---

## Testing Checklist (Throughout Development)

### Unit Tests
- [ ] Validation utilities
- [ ] Formatting utilities
- [ ] RxNorm service methods
- [ ] FDA service methods
- [ ] Calculator service methods
- [ ] Error handling utilities

### Integration Tests
- [ ] Normalize API endpoint
- [ ] NDC API endpoint
- [ ] Calculate API endpoint
- [ ] Complete API workflow

### End-to-End Tests
- [ ] User enters drug name and gets results
- [ ] Inactive NDC warning display
- [ ] Overfill/underfill detection
- [ ] Error handling for invalid inputs
- [ ] Mobile responsiveness

---

## Success Criteria Validation

Before considering the project complete, verify:
- [ ] Medication normalization accuracy tested with 20+ real drugs
- [ ] Response time consistently under 2 seconds
- [ ] All P0 requirements implemented and tested
- [ ] Application works on mobile, tablet, and desktop
- [ ] Accessible via keyboard navigation
- [ ] Error messages are clear and actionable
- [ ] JSON output is properly formatted
- [ ] Documentation is complete and accurate

---

## Notes
- Each PR should be reviewed and tested before merging
- Maintain consistent code formatting throughout
- Follow TypeScript strict mode requirements
- Keep components focused and reusable
- Write meaningful commit messages
- Update tests as code changes