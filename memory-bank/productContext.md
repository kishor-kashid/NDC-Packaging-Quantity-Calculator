# Product Context: NDC Packaging & Quantity Calculator

## Why This Project Exists

Pharmacy systems frequently encounter challenges in accurately matching prescriptions to valid NDCs and determining correct dispense quantities. Common issues include:

- **Dosage Form Mismatches** - Prescriptions don't match available NDC dosage forms
- **Package Size Errors** - Incorrect package sizes selected for dispense quantities
- **Inactive NDCs** - System attempts to use discontinued or inactive NDC codes
- **Manual Calculation Errors** - Human error in calculating dispense quantities from SIG

These problems lead to:
- Claim rejections from insurance providers
- Operational delays in prescription fulfillment
- Patient frustration and dissatisfaction
- Increased manual intervention and rework

## Problems It Solves

1. **NDC Matching Accuracy** - Automatically matches prescriptions to valid, active NDCs
2. **Quantity Calculation** - Accurately calculates dispense quantities from SIG and days' supply
3. **Package Optimization** - Selects optimal NDC packages to minimize waste and overfill
4. **Error Prevention** - Flags inactive NDCs and quantity mismatches before submission
5. **Workflow Efficiency** - Reduces manual lookup and calculation time

## How It Should Work

### User Workflow

1. **Input Phase**
   - User enters drug name (or NDC), SIG (dosing instructions), and days' supply
   - System validates inputs and provides real-time feedback

2. **Processing Phase**
   - System normalizes drug name to RxCUI using RxNorm API
   - Retrieves available NDCs and package information from FDA API
   - Calculates total quantity needed based on SIG and days' supply
   - Selects optimal NDC packages

3. **Results Phase**
   - Displays calculated dispense quantity
   - Shows available NDC options in sortable table
   - Highlights inactive NDCs with warnings
   - Alerts on overfill/underfill situations
   - Provides structured JSON output for integration

### Key Features

- **Drug Normalization** - Handles brand names, generic names, and common misspellings
- **Drug Autocomplete** - Real-time drug name suggestions with RxNorm integration
- **SIG Parsing** - Enhanced parsing with support for:
  - Simple patterns (e.g., "Take 1 tablet twice daily")
  - Complex patterns (e.g., "Take 1 tablet in the morning and 1 at bedtime")
  - Dose ranges (e.g., "Take 1-2 tablets as needed")
  - Tapering schedules (e.g., "Take 2 tablets on day 1, then 1 tablet daily")
  - PRN medications with conservative estimates
  - AI-assisted parsing for complex cases
- **Package Selection** - Algorithm selects best combination of packages to meet quantity needs
- **Dosage Form Filtering** - Filter NDCs by dosage form with mismatch warnings
- **Strength Filtering** - Filter NDCs by drug strength with mismatch warnings
- **Insurance Formulary Checks** - Check coverage, tier levels, and prior authorization
- **Drug Interaction Warnings** - Check drug-drug interactions, allergies, and contraindications
- **Special Cases** - Handles liquids, insulin, inhalers, and other special dosage forms
- **Multi-Pack Support** - Calculates combinations of packages when single package insufficient

## User Experience Goals

1. **Simplicity** - Intuitive interface requiring minimal training
2. **Speed** - Results in under 2 seconds
3. **Clarity** - Clear warnings and recommendations
4. **Accessibility** - Works with keyboard navigation and screen readers
5. **Responsiveness** - Functions on desktop, tablet, and mobile devices

## Integration Points

- **RxNorm API** - For drug name normalization to RxCUI
- **FDA NDC Directory API** - For NDC and packaging information
- **OpenAI API** - For AI-accelerated features (future enhancement)
- **Pharmacy Systems** - JSON output format enables integration (P2 feature)

## User Personas

### Primary: Pharmacist
- **Needs:** Accurate NDC matching, quick results, confidence in calculations
- **Pain Points:** Time-consuming manual lookups, calculation errors
- **Goals:** Fulfill prescriptions accurately and efficiently

### Primary: Pharmacy Technician
- **Needs:** Streamlined tools, error prevention, clear guidance
- **Pain Points:** Complex manual processes, uncertainty in calculations
- **Goals:** Process prescriptions quickly without errors

### Secondary: Healthcare Administrator
- **Needs:** Operational efficiency metrics, reduced errors
- **Pain Points:** High error rates, claim rejections, patient complaints
- **Goals:** Improve overall pharmacy operations and patient satisfaction

