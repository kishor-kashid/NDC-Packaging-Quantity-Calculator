# Quick Start Guide

## Testing the Application

### Step 1: Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 2: Test with Sample Data

#### New Features to Try

1. **Drug Autocomplete**: Start typing a drug name (e.g., "Lisinopril") and see real-time suggestions
2. **Filters**: Use dosage form and strength filters to narrow down NDC options
3. **Insurance Checks**: Enable "Check Insurance Coverage" to see coverage warnings
4. **Interaction Checks**: Enable "Check Drug Interactions" and add allergies/conditions
5. **Complex SIG Patterns**: Try patterns like:
   - "Take 1 tablet in the morning and 1 at bedtime"
   - "Take 1-2 tablets as needed"
   - "Take 2 tablets on day 1, then 1 tablet daily"

#### Option A: Use Common Drug Names

Try these drug names that are known to work with RxNorm:

1. **Lisinopril**
   - SIG: "Take 1 tablet by mouth twice daily"
   - Days Supply: 30
   - Expected: 60 tablets

2. **Metformin**
   - SIG: "Take 2 tablets with food twice daily"
   - Days Supply: 90
   - Expected: 360 tablets

3. **Atorvastatin**
   - SIG: "Take 1 tablet once daily"
   - Days Supply: 30
   - Expected: 30 tablets

#### Option B: Use NDC Codes (If Available)

If you have an NDC code, you can use that instead:

- NDC: `68180-0101-01` (example format)
- SIG: "Take 1 tablet once daily"
- Days Supply: 30

### Step 3: Understanding the Results

The application will:
1. **Normalize** the drug name to an RxCUI code
2. **Retrieve** available NDC packages
3. **Calculate** the total quantity needed
4. **Recommend** optimal package combinations
5. **Warn** about overfill/underfill or inactive NDCs

## Common Issues

### "Drug not found" Error

**Solution:**
- Check spelling (RxNorm is case-sensitive)
- Try the generic name instead of brand name
- Try without strength (e.g., "Lisinopril" instead of "Lisinopril 10mg")
- Use an NDC code if available

### "Failed to normalize drug name" Error

**Solution:**
- The drug may not be in the RxNorm database
- Try a different drug name
- Use an NDC code instead
- Check the browser console for detailed error messages

### No NDC Packages Found

**What it means:**
- The quantity is still calculated correctly
- But no package recommendations are available
- This can happen if:
  - The drug has no active NDCs in the FDA database
  - The API calls failed (check internet connection)

## Tips for Best Results

1. **Use Exact Drug Names**
   - ✅ "Lisinopril" (works)
   - ❌ "lisinopril" or "LISINOPRIL" (may not work)

2. **Clear SIG Format**
   - ✅ "Take 1 tablet twice daily"
   - ✅ "Take 2 capsules every 8 hours"
   - ❌ "1 tablet" (missing frequency)

3. **Valid Days Supply**
   - Must be a positive integer
   - Common: 7, 14, 30, 60, 90

4. **Check Internet Connection**
   - The app requires access to RxNorm and FDA APIs
   - Ensure you're connected to the internet

## Testing Without APIs

If you want to test the UI without API calls, you can:

1. Use the sample data from `src/lib/data/sample-data.ts`
2. Mock the API responses
3. Test individual components in isolation

See `SAMPLE_DATA.md` for more examples.

