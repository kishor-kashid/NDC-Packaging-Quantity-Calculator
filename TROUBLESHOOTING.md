# Troubleshooting Guide

## Common Issues and Solutions

### RxNorm API 404 Errors

**Problem:** Getting "RxNorm API error: 404 Not Found" when searching for a drug.

**Solutions:**

1. **Check Drug Name Spelling**
   - RxNorm is case-sensitive and requires exact spelling
   - Try the generic name instead of brand name (or vice versa)
   - Example: Try "Lisinopril" instead of "lisinopril" or "LISINOPRIL"

2. **Use NDC Code Instead**
   - If you have the NDC code, use that instead of the drug name
   - NDC format: `12345-6789-01` (11 digits with dashes)

3. **Try Alternative Drug Names**
   - Some drugs have multiple names
   - Try the full generic name with strength: "Lisinopril 10mg"
   - Try without strength: "Lisinopril"

4. **Common Working Drug Names**
   - Lisinopril
   - Metformin
   - Atorvastatin
   - Amlodipine
   - Omeprazole

### FDA API Errors

**Problem:** Getting errors when retrieving NDC information.

**Solutions:**

1. **Check NDC Format**
   - Must be 10 or 11 digits
   - Can include dashes: `12345-6789-01`
   - Or without: `12345678901`

2. **Rate Limiting**
   - FDA API has rate limits
   - Wait a few seconds between requests
   - The service includes automatic retry logic

### Calculation Errors

**Problem:** Calculation fails or returns incorrect results.

**Solutions:**

1. **Check SIG Format**
   - Must include dose, frequency, and unit
   - Examples:
     - ✅ "Take 1 tablet twice daily"
     - ✅ "Take 2 capsules every 8 hours"
     - ❌ "1 tablet" (missing frequency)
     - ❌ "twice daily" (missing dose)

2. **Check Days Supply**
   - Must be a positive integer
   - Typically between 7 and 365 days
   - Common values: 30, 60, 90

### Network Errors

**Problem:** "Unable to connect to the server" errors.

**Solutions:**

1. **Check Internet Connection**
   - Ensure you have an active internet connection
   - The app requires access to RxNorm and FDA APIs

2. **Check API Availability**
   - RxNorm API: https://rxnav.nlm.nih.gov/REST
   - FDA API: https://api.fda.gov/drug/ndc.json
   - Try accessing these URLs directly in your browser

3. **Firewall/Proxy Issues**
   - Check if your firewall is blocking API requests
   - Corporate networks may block external API calls

### Development Mode Testing

If you're in development and APIs are unavailable, you can:

1. **Use Sample Data**
   - Import sample data from `src/lib/data/sample-data.ts`
   - Use for testing UI components without API calls

2. **Mock API Responses**
   - Create mock responses for testing
   - See `SAMPLE_DATA.md` for example responses

### Error Messages Explained

- **"Drug not found"**: The drug name doesn't exist in RxNorm database
- **"No RxCUI found"**: Couldn't normalize the drug name to an RxCUI code
- **"No NDC packages found"**: No NDC packages available for this drug
- **"Validation error"**: Input doesn't meet requirements (check format)
- **"Timeout error"**: API request took too long (>2 seconds)

### Getting Help

1. Check the browser console for detailed error messages
2. Verify your inputs match the expected formats
3. Try with known working drug names (see above)
4. Check the API endpoints are accessible
5. Review the sample data for correct formats

