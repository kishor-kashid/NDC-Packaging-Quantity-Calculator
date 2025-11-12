# API Documentation

**NDC Packaging & Quantity Calculator API Reference**

This document provides complete API documentation for all endpoints in the NDC Packaging & Quantity Calculator application.

## Base URL

- **Development:** `http://localhost:5173`
- **Production:** (To be determined)

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE",
    "details": {
      // Additional error details
    }
  }
}
```

## Endpoints

### 1. Drug Search (Autocomplete)

**Endpoint:** `GET /api/drug-search`

**Description:** Provides autocomplete/search suggestions for drug names using RxNorm API.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (minimum 2 characters) |
| `limit` | number | No | Maximum number of results (default: 10) |

**Example Request:**

```bash
GET /api/drug-search?q=Lisinopril&limit=10
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "name": "Lisinopril",
        "rxcui": "29046",
        "strength": "10mg",
        "dosageForm": "TABLET",
        "isBrand": false
      },
      {
        "name": "Lisinopril Brand",
        "rxcui": "29046",
        "strength": "10mg",
        "dosageForm": "TABLET",
        "isBrand": true
      }
    ],
    "query": "Lisinopril",
    "count": 2
  }
}
```

**Error Codes:**
- `DRUG_SEARCH_ERROR` - Failed to search drug names

---

### 2. Normalize Drug Name

**Endpoint:** `POST /api/normalize`

**Description:** Normalizes a drug name or NDC code to an RxCUI (RxNorm Concept Unique Identifier).

**Request Body:**

```typescript
{
  drugName?: string;  // Drug name (brand or generic)
  ndc?: string;      // NDC code (8-11 digits, with or without dashes)
}
```

**Note:** Either `drugName` or `ndc` must be provided.

**Example Request:**

```json
{
  "drugName": "Lisinopril"
}
```

**Example Response:**

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

**Error Codes:**
- `VALIDATION_ERROR` - Invalid input (missing drugName/ndc, invalid format)
- `NORMALIZATION_ERROR` - Failed to normalize drug name
- `NOT_FOUND` - Drug name or NDC not found in RxNorm

---

### 3. Get NDCs

**Endpoint:** `POST /api/ndc`

**Description:** Retrieves available NDC codes and package information for a given RxCUI.

**Request Body:**

```typescript
{
  rxcui: string;      // Required: RxCUI code
  drugName?: string;  // Optional: Drug name for fallback search
}
```

**Example Request:**

```json
{
  "rxcui": "29046",
  "drugName": "Lisinopril"
}
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "ndcs": [
      {
        "ndc": "68180-0101-01",
        "productName": "Lisinopril",
        "manufacturer": "A-S Medication Solutions",
        "dosageForm": "TABLET",
        "strength": "10mg",
        "packageInfo": {
          "size": "1",
          "unit": "tablet",
          "type": "BOTTLE",
          "quantity": 1
        },
        "status": "ACTIVE"
      }
    ],
    "total": 1,
    "activeCount": 1
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR` - Missing or invalid RxCUI
- `NDC_RETRIEVAL_ERROR` - Failed to retrieve NDCs

---

### 4. Calculate Quantity

**Endpoint:** `POST /api/calculate`

**Description:** Complete calculation workflow: normalizes drug name/NDC, retrieves NDCs, calculates quantity, and selects optimal packages. Supports advanced features like filtering, insurance checks, and interaction warnings.

**Request Body:**

```typescript
{
  // Required fields
  drugName?: string;        // Drug name OR NDC (one required)
  ndc?: string;            // NDC code (8-11 digits, with/without dashes)
  sig: string;             // SIG (dosing instructions)
  daysSupply: number;      // Days' supply (positive integer)
  
  // Optional: Filtering
  dosageFormFilter?: DosageFormFilter;  // 'TABLET' | 'CAPSULE' | 'LIQUID' | 'INJECTION' | 'INHALER' | 'TOPICAL' | 'SUPPOSITORY' | 'ALL' | null
  strengthFilter?: string;              // e.g., "20mg", "5mg/5ml"
  
  // Optional: Insurance checks
  checkInsurance?: boolean;
  insurancePlan?: string;                // e.g., "Blue Cross Blue Shield"
  
  // Optional: Interaction checks
  checkInteractions?: boolean;
  knownAllergies?: string[];             // e.g., ["Penicillin", "Sulfa"]
  patientConditions?: string[];          // e.g., ["Pregnancy", "Liver Disease"]
  currentMedications?: NDC[];            // Array of NDC objects for interaction checking
}
```

**Note:** Either `drugName` or `ndc` must be provided. The system auto-detects NDC codes in the `drugName` field.

**Example Request (Basic):**

```json
{
  "drugName": "Lisinopril",
  "sig": "Take 1 tablet twice daily",
  "daysSupply": 30
}
```

**Example Request (Advanced with Filters):**

```json
{
  "drugName": "Lisinopril",
  "sig": "Take 1 tablet twice daily",
  "daysSupply": 30,
  "dosageFormFilter": "TABLET",
  "strengthFilter": "20mg",
  "checkInsurance": true,
  "insurancePlan": "Blue Cross Blue Shield",
  "checkInteractions": true,
  "knownAllergies": ["Penicillin"],
  "patientConditions": ["Pregnancy"]
}
```

**Example Response:**

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
      "instructions": "Take 1 tablet twice daily"
    },
    "totalQuantity": 60,
    "unit": "tablet",
    "daysSupply": 30,
    "recommendations": [
      {
        "ndc": {
          "ndc": "50090-7022",
          "productName": "Lisinopril",
          "manufacturer": "A-S Medication Solutions",
          "dosageForm": "TABLET",
          "strength": "10mg",
          "packageInfo": {
            "size": "1",
            "unit": "tablet",
            "type": "BOTTLE",
            "quantity": 1
          },
          "status": "ACTIVE"
        },
        "packageCount": 60,
        "totalQuantity": 60,
        "unit": "tablet",
        "exactMatch": true,
        "variancePercentage": 0
      }
    ],
    "availableNDCs": [
      // Array of all available NDCs
    ],
    "warnings": [
      {
        "type": "STRENGTH_MISMATCH",
        "message": "100 NDC(s) have strength mismatch. Expected: 20mg",
        "severity": "medium",
        "details": {
          "expectedStrength": "20mg",
          "mismatchCount": 100
        }
      }
    ],
    "success": true
  }
}
```

**Complex SIG Patterns Supported:**

1. **Multiple Times:**
   ```json
   {
     "sig": "Take 1 tablet in the morning and 1 at bedtime"
   }
   ```
   Result: `parsedSIG.isComplex = true`, `parsedSIG.schedule` contains multiple entries

2. **Dose Ranges (PRN):**
   ```json
   {
     "sig": "Take 1-2 tablets as needed"
   }
   ```
   Result: `parsedSIG.prn = true`, `parsedSIG.averageDailyDose` calculated

3. **Tapering Schedules:**
   ```json
   {
     "sig": "Take 2 tablets on day 1, then 1 tablet daily"
   }
   ```
   Result: `parsedSIG.isComplex = true`, `parsedSIG.schedule` with day ranges

**Warning Types:**

- `OVERFILL` - Dispensing more than needed
- `UNDERFILL` - Dispensing less than needed
- `INACTIVE_NDC` - NDC is inactive/discontinued
- `PACKAGE_MISMATCH` - Package size doesn't match well
- `UNUSUAL_QUANTITY` - Unusually large or small quantity
- `DOSAGE_FORM_MISMATCH` - Dosage form doesn't match filter
- `STRENGTH_MISMATCH` - Strength doesn't match filter
- `INSURANCE_COVERAGE` - NDC not covered by insurance
- `PRIOR_AUTH_REQUIRED` - Prior authorization required
- `DRUG_INTERACTION` - Drug-drug interaction detected
- `ALLERGY` - Allergy detected
- `CONTRAINDICATION` - Contraindication detected

**Error Codes:**
- `VALIDATION_ERROR` - Invalid input (missing required fields, invalid format)
- `NORMALIZATION_ERROR` - Failed to normalize drug name
- `NDC_NOT_FOUND` - NDC code not found in FDA database
- `NOT_FOUND` - Drug name not found
- `CALCULATION_ERROR` - Error during quantity calculation

---

## NDC Code Formats

The API supports NDC codes in various formats:

- **8 digits:** `0591-0885` (4-4 format, product NDC)
- **9 digits:** `591-0885-0` (4-4-1 format)
- **10 digits:** `68180-981` (5-4-1 format, product NDC)
- **11 digits:** `68180-981-01` (5-4-2 format, package NDC)

NDC codes can be provided with or without dashes. The system auto-detects and normalizes them.

## SIG (Dosing Instructions) Patterns

The API supports various SIG patterns:

### Simple Patterns
- "Take 1 tablet twice daily"
- "Take 2 capsules every 8 hours"
- "Take 10ml once daily"

### Complex Patterns
- **Multiple Times:** "Take 1 tablet in the morning and 1 at bedtime"
- **Dose Ranges:** "Take 1-2 tablets as needed"
- **Tapering:** "Take 2 tablets on day 1, then 1 tablet daily"
- **PRN:** "Take 1 tablet every 4-6 hours as needed for pain"

## Dosage Form Filter Values

- `TABLET` - Tablets
- `CAPSULE` - Capsules
- `LIQUID` - Liquid medications
- `INJECTION` - Injections
- `INHALER` - Inhalers
- `TOPICAL` - Topical medications
- `SUPPOSITORY` - Suppositories
- `ALL` or `null` - All forms (no filter)

## Rate Limits

- **RxNorm API:** Public API, rate limits apply (typically 20 requests/second)
- **FDA API:** Public API, rate limits apply (typically 1000 requests/day)
- **OpenAI API:** Based on your API key plan (optional, only used for AI-assisted SIG parsing)

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found (drug/NDC not found)
- `500` - Internal Server Error

Error responses include:
- `message` - Human-readable error message
- `code` - Error code for programmatic handling
- `details` - Additional error information

## Examples

### Example 1: Basic Calculation

```bash
curl -X POST http://localhost:5173/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "drugName": "Lisinopril",
    "sig": "Take 1 tablet twice daily",
    "daysSupply": 30
  }'
```

### Example 2: Using NDC Code

```bash
curl -X POST http://localhost:5173/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "ndc": "68180-0101-01",
    "sig": "Take 1 tablet once daily",
    "daysSupply": 30
  }'
```

### Example 3: With Filters and Insurance

```bash
curl -X POST http://localhost:5173/api/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "drugName": "Lisinopril",
    "sig": "Take 1 tablet twice daily",
    "daysSupply": 30,
    "dosageFormFilter": "TABLET",
    "strengthFilter": "20mg",
    "checkInsurance": true,
    "insurancePlan": "Blue Cross Blue Shield"
  }'
```

### Example 4: Drug Search

```bash
curl "http://localhost:5173/api/drug-search?q=Lisinopril&limit=5"
```

## Integration Notes

1. **Auto-Detection:** The `/api/calculate` endpoint automatically detects NDC codes in the `drugName` field
2. **Fallback Logic:** If RxNorm lookup fails for an NDC, the system attempts direct FDA lookup
3. **Performance:** Formulary and interaction checks are limited to first 5-10 NDCs for performance
4. **Optional Features:** Insurance and interaction checks are optional and can be enabled via flags
5. **AI Parsing:** AI-assisted SIG parsing is optional and requires OpenAI API key (falls back to rule-based parsing)

## Support

For issues or questions:
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
- Review [Memory Bank](./memory-bank/) documentation
- See [Sample Data](./SAMPLE_DATA.md) for test examples

