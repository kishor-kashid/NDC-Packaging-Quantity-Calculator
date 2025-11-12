# Active Context: NDC Packaging & Quantity Calculator

## Current Work Focus

**Phase:** Foundation Development  
**Status:** PR #1 Complete - Project Setup & Configuration Done

## Recent Changes

- ✅ PRD and Task List reviewed and understood
- ✅ Memory Bank structure created
- ✅ Project rules and patterns documented
- ✅ PR #1 - Project Setup & Configuration completed
  - SvelteKit project initialized with TypeScript
  - Project structure created (routes, lib, components, services, utils, types)
  - TypeScript strict mode configured
  - Dependencies installed
  - Basic layout and home page created
  - Build verified successfully

## Next Steps

1. **Immediate:** Begin PR #2 - TypeScript Type Definitions
   - Define drug-related types
   - Define NDC-related types
   - Define calculation types
   - Create shared utility types

2. **Short-term:** Complete foundational PRs (#1-3)
   - Project setup
   - Type definitions
   - Utility functions

3. **Medium-term:** Implement core services (PRs #4-6)
   - RxNorm API service
   - FDA NDC Directory API service
   - Quantity calculator service

## Active Decisions and Considerations

### Technical Decisions Made
- **Framework:** SvelteKit (as specified in PRD)
- **Language:** TypeScript with strict mode
- **Architecture:** Service-based with API routes
- **Testing:** Unit, integration, and E2E tests planned

### Pending Decisions
- **API Keys Management:** How to handle RxNorm and FDA API keys (environment variables)
- **Error Handling Strategy:** Specific error message formats and user-facing messages
- **Caching Strategy:** Whether to implement caching for API responses (performance PR)
- **Deployment Target:** Specific GCP services to use (Cloud Run, App Engine, etc.)

### Current Blockers
- None identified at this time

### Development Environment
- **OS:** Windows 10
- **Shell:** PowerShell
- **Node Version:** Installed (via npm)
- **Package Manager:** npm
- **Project Status:** SvelteKit initialized, dependencies installed, build verified

## Key Workflows to Implement

1. **Normalization Workflow**
   - Input: Drug name or NDC
   - Process: RxNorm API call
   - Output: RxCUI

2. **NDC Retrieval Workflow**
   - Input: RxCUI
   - Process: FDA API call
   - Output: List of NDCs with package information

3. **Calculation Workflow**
   - Input: RxCUI, SIG, days' supply
   - Process: Parse SIG → Calculate quantity → Select packages
   - Output: Dispense recommendations with warnings

## Testing Priorities

- Unit tests for all services and utilities
- Integration tests for API endpoints
- E2E tests for complete user workflows
- Performance testing to meet <2 second requirement
- Accessibility testing with screen readers

## Known Constraints

- **Performance:** Must complete in <2 seconds per query
- **API Dependencies:** Relies on external APIs (RxNorm, FDA) availability
- **Compliance:** Must adhere to healthcare data protection standards
- **Browser Support:** Desktop and tablet platforms (mobile responsive)

## Questions to Resolve

1. What are the exact API endpoints and authentication methods for RxNorm and FDA APIs?
2. What is the expected format for SIG parsing? (Natural language examples needed)
3. What constitutes an "optimal" package selection? (Minimize waste? Minimize packages?)
4. What are the specific overfill/underfill thresholds for warnings?

