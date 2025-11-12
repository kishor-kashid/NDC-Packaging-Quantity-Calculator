# Sample Data for Testing

This document provides sample data for testing the NDC Packaging & Quantity Calculator.

## Quick Test Examples

### Example 1: Simple Tablet Prescription
```json
{
  "drugName": "Lisinopril",
  "sig": "Take 1 tablet by mouth twice daily",
  "daysSupply": 30
}
```
**Expected Result:** 60 tablets total (1 tablet × 2 times/day × 30 days)

### Example 2: Multiple Tablets
```json
{
  "drugName": "Metformin",
  "sig": "Take 2 tablets with food twice daily",
  "daysSupply": 90
}
```
**Expected Result:** 360 tablets total (2 tablets × 2 times/day × 90 days)

### Example 3: Using NDC Instead of Drug Name
```json
{
  "ndc": "68180-0101-01",
  "sig": "Take 1 capsule once daily",
  "daysSupply": 30
}
```
**Expected Result:** 30 capsules total

### Example 4: Liquid Medication
```json
{
  "drugName": "Amoxicillin",
  "sig": "Take 5ml three times daily",
  "daysSupply": 10
}
```
**Expected Result:** 150ml total (5ml × 3 times/day × 10 days)

### Example 5: Inhaler
```json
{
  "drugName": "Albuterol",
  "sig": "Take 2 puffs every 4 hours as needed",
  "daysSupply": 30
}
```
**Expected Result:** 360 puffs total (2 puffs × 6 times/day × 30 days)

### Example 6: Complex Pattern - Multiple Times
```json
{
  "drugName": "Lisinopril",
  "sig": "Take 1 tablet in the morning and 1 at bedtime",
  "daysSupply": 30
}
```
**Expected Result:** 60 tablets total (1 tablet × 2 times/day × 30 days)

### Example 7: Dose Range (PRN)
```json
{
  "drugName": "Ibuprofen",
  "sig": "Take 1-2 tablets as needed",
  "daysSupply": 7
}
```
**Expected Result:** Conservative estimate based on average dose and frequency

### Example 8: With Filters
```json
{
  "drugName": "Lisinopril",
  "sig": "Take 1 tablet twice daily",
  "daysSupply": 30,
  "dosageFormFilter": "TABLET",
  "strengthFilter": "20mg"
}
```
**Expected Result:** 60 tablets, filtered to tablet form with 20mg strength

### Example 9: With Insurance Check
```json
{
  "drugName": "Lisinopril",
  "sig": "Take 1 tablet twice daily",
  "daysSupply": 30,
  "checkInsurance": true,
  "insurancePlan": "Blue Cross Blue Shield"
}
```
**Expected Result:** 60 tablets + insurance coverage warnings if applicable

## Sample Drug Names

### Brand Names
- Lisinopril
- Metformin
- Atorvastatin
- Amlodipine
- Omeprazole
- Metoprolol
- Losartan
- Albuterol
- Gabapentin
- Tramadol

### Generic Names
- Lisinopril 10mg
- Metformin HCl 500mg
- Atorvastatin Calcium 20mg
- Amlodipine Besylate 5mg
- Omeprazole 20mg

## Sample NDC Codes

- `68180-0101-01`
- `00069-1234-56`
- `12345-6789-01`
- `54321-9876-54`
- `11111-2222-33`

## Sample SIG (Dosing Instructions)

1. "Take 1 tablet by mouth twice daily"
2. "Take 2 capsules every 8 hours"
3. "Take 10ml by mouth once daily"
4. "1 tablet every 12 hours"
5. "Take 1 tablet in the morning and 1 tablet at bedtime"
6. "Take 2 tablets with food three times daily"
7. "Take 1 capsule by mouth once daily"
8. "Take 1-2 tablets every 4-6 hours as needed for pain"
9. "Take 1 tablet in the morning"
10. "Take 1 tablet by mouth twice daily with meals"

## Sample Days' Supply

Common values: 7, 14, 28, 30, 60, 90, 100, 180, 365

## Test Scenarios

### Exact Match Scenario
- **Drug:** Lisinopril
- **SIG:** "Take 1 tablet twice daily"
- **Days Supply:** 30
- **Expected:** 60 tablets
- **Package:** 30-tablet bottle (2 packages needed)

### Overfill Scenario
- **Drug:** Metformin
- **SIG:** "Take 2 tablets twice daily"
- **Days Supply:** 30
- **Expected:** 120 tablets
- **Package:** 90-tablet bottle (2 packages = 180 tablets, 50% overfill)

### Underfill Scenario
- **Drug:** Atorvastatin
- **SIG:** "Take 1 tablet daily"
- **Days Supply:** 90
- **Expected:** 90 tablets
- **Package:** 30-tablet bottle (3 packages = 90 tablets, exact match)

### Liquid Medication
- **Drug:** Amoxicillin Suspension
- **SIG:** "Take 5ml three times daily"
- **Days Supply:** 10
- **Expected:** 150ml
- **Package:** 100ml bottle (2 bottles = 200ml, 33% overfill)

## Expected API Responses

### Normalize Response
```json
{
  "success": true,
  "data": {
    "rxcui": "29046",
    "drugName": "Lisinopril",
    "normalized": true
  }
}
```

### NDC Response
```json
{
  "success": true,
  "data": {
    "ndcs": [
      {
        "ndc": "68180-0101-01",
        "productName": "Lisinopril 10mg Tablet",
        "manufacturer": "Example Pharmaceuticals",
        "dosageForm": "TABLET",
        "strength": "10mg",
        "packageInfo": {
          "size": "30",
          "unit": "tablet",
          "type": "BOTTLE",
          "quantity": 30
        },
        "status": "ACTIVE"
      }
    ],
    "total": 1,
    "activeCount": 1
  }
}
```

### Calculate Response
```json
{
  "success": true,
  "data": {
    "drugName": "Lisinopril",
    "rxcui": "29046",
    "parsedSIG": {
      "dose": 1,
      "unit": "tablet",
      "frequency": 2,
      "instructions": "Take 1 tablet by mouth twice daily"
    },
    "totalQuantity": 60,
    "unit": "tablet",
    "daysSupply": 30,
    "recommendations": [
      {
        "ndc": {...},
        "packageCount": 2,
        "totalQuantity": 60,
        "unit": "tablet",
        "exactMatch": true,
        "variancePercentage": 0
      }
    ],
    "warnings": [],
    "success": true
  }
}
```

## Error Scenarios

### Drug Not Found
```json
{
  "success": false,
  "error": {
    "message": "No RxCUI found for drug: InvalidDrugName",
    "code": "NOT_FOUND"
  }
}
```

### Invalid Input
```json
{
  "success": false,
  "error": {
    "message": "SIG (dosing instructions) is required",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "sig",
        "message": "SIG (dosing instructions) is required"
      }
    ]
  }
}
```

## Usage in Development

You can import sample data in your code:

```typescript
import {
  sampleDrugNames,
  sampleSIGs,
  sampleCalculationInputs,
  sampleCalculationResult,
  testScenarios
} from '$lib/data/sample-data.js';
```

## Testing Checklist

- [ ] Test with brand name
- [ ] Test with generic name
- [ ] Test with NDC code
- [ ] Test exact match scenarios
- [ ] Test overfill scenarios
- [ ] Test underfill scenarios
- [ ] Test liquid medications
- [ ] Test inhalers
- [ ] Test inactive NDCs
- [ ] Test error handling
- [ ] Test validation errors
- [ ] Test large quantities (>1000 units)

