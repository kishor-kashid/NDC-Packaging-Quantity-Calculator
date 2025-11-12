# Testing Guide

This guide will help you test all the features of the NDC Packaging & Quantity Calculator.

## Prerequisites

1. **Install Dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## Feature Testing Scenarios

### 1. Drug Name Autocomplete/Search

**Test Steps:**
1. Click on the "Drug Name or NDC" input field
2. Start typing a drug name (e.g., "Lisinopril")
3. Wait for suggestions to appear (should show after 2+ characters)
4. Use arrow keys to navigate suggestions
5. Press Enter or click to select a suggestion

**Expected Results:**
- ✅ Suggestions appear in dropdown after typing 2+ characters
- ✅ Loading spinner shows while searching
- ✅ Suggestions include drug names from RxNorm
- ✅ Keyboard navigation works (Arrow Up/Down, Enter, Escape)
- ✅ Clicking a suggestion fills the input field

**Test Data:**
- "Lisinopril"
- "Metformin"
- "Atorvastatin"
- "Amlodipine"

---

### 2. Dosage Form Matching

**Test Steps:**
1. Enter a drug name: "Lisinopril"
2. Enter SIG: "Take 1 tablet twice daily"
3. In Filter Panel, select "Tablet" from Dosage Form dropdown
4. Enter Days Supply: 30
5. Click "Calculate"

**Expected Results:**
- ✅ Only tablet NDCs are shown in results
- ✅ If capsule NDCs exist, they should be filtered out
- ✅ Warning appears if dosage form mismatch detected
- ✅ NDC table shows filtered results

**Test Scenarios:**
- **Tablet Filter**: Drug name "Lisinopril", Dosage Form: "Tablet"
- **Capsule Filter**: Drug name "Omeprazole", Dosage Form: "Capsule"
- **Liquid Filter**: Drug name "Amoxicillin", Dosage Form: "Liquid"
- **Auto-Detection**: SIG "Take 1 tablet twice daily" should auto-detect "Tablet"

---

### 3. Strength Matching

**Test Steps:**
1. Enter drug name: "Lisinopril 20mg" (or "Lisinopril" and strength "20mg" in filter)
2. Enter SIG: "Take 1 tablet twice daily"
3. Enter Days Supply: 30
4. In Filter Panel, enter "20mg" in Strength field
5. Click "Calculate"

**Expected Results:**
- ✅ Only 20mg NDCs are shown
- ✅ Warning appears if strength mismatch detected
- ✅ Strength extracted from drug name if not specified

**Test Scenarios:**
- **Exact Match**: "Lisinopril 20mg" → Should show only 20mg NDCs
- **Mismatch**: "Lisinopril 20mg" but only 10mg NDCs available → Warning shown
- **Range**: "5mg/5ml" for liquid medications

---

### 4. Enhanced SIG Parsing

**Test Steps:**
1. Enter drug name: "Lisinopril"
2. Test different SIG patterns (see below)
3. Enter Days Supply: 30
4. Click "Calculate"

**Expected Results:**
- ✅ Simple patterns parsed correctly
- ✅ Complex patterns (ranges, multiple times, tapering) handled
- ✅ Quantity calculated accurately for all patterns

**Test SIG Patterns:**

**Simple:**
- "Take 1 tablet twice daily" → 60 tablets (1 × 2 × 30)
- "Take 2 capsules every 8 hours" → 180 capsules (2 × 3 × 30)

**Range (PRN):**
- "Take 1-2 tablets as needed" → Estimated quantity (conservative)
- "Take 1-2 tablets as needed for pain" → PRN flag set

**Multiple Times:**
- "Take 1 tablet in the morning and 1 at bedtime" → 60 tablets (2 × 30)
- "Take 1 tablet with breakfast, lunch, and dinner" → 90 tablets (3 × 30)

**Tapering:**
- "Take 2 tablets on day 1, then 1 tablet daily" → 31 tablets (2 + 29)
- "Take 3 tablets on days 1-3, then 1 tablet daily" → 60 tablets (9 + 27)

---

### 5. Insurance Formulary Integration

**Test Steps:**
1. Enter drug name: "Lisinopril"
2. Enter SIG: "Take 1 tablet twice daily"
3. Enter Days Supply: 30
4. Check "Check Insurance Coverage" checkbox
5. (Optional) Enter insurance plan name
6. Click "Calculate"

**Expected Results:**
- ✅ Insurance coverage checked for NDCs
- ✅ Warnings shown for non-covered NDCs
- ✅ Prior authorization warnings if required
- ✅ Tier information displayed (if available)

**Test Scenarios:**
- **Covered Drug**: Common drugs like "Lisinopril", "Metformin" → Should show as covered
- **Non-Covered**: Less common drugs → Warning shown
- **Prior Auth**: Some drugs → PA warning shown

**Note**: Currently uses mock data. In production, this would connect to real formulary APIs.

---

### 6. Drug Interaction Warnings

**Test Steps:**
1. Enter drug name: "Lisinopril"
2. Enter SIG: "Take 1 tablet twice daily"
3. Enter Days Supply: 30
4. Check "Check Drug Interactions" checkbox
5. Enter Known Allergies: "Penicillin, Sulfa"
6. Enter Patient Conditions: "Pregnancy, Liver Disease"
7. Click "Calculate"

**Expected Results:**
- ✅ Allergy warnings if drug matches known allergies
- ✅ Contraindication warnings for patient conditions
- ✅ Drug interaction warnings (if current medications provided)
- ✅ Severity levels shown (high, medium, low)

**Test Scenarios:**

**Allergy Check:**
- Known Allergies: "Penicillin" → Drug: "Amoxicillin" → Should show allergy warning
- Known Allergies: "Sulfa" → Drug: "Sulfamethoxazole" → Should show allergy warning

**Contraindication Check:**
- Conditions: "Pregnancy" → Drug: "Lisinopril" (ACE inhibitor) → Should show contraindication
- Conditions: "Liver Disease" → Drug: "Atorvastatin" (statin) → Should show contraindication

**Note**: Currently uses pattern matching. In production, this would connect to real interaction APIs.

---

### 7. Complete Workflow Test

**Full Scenario:**
1. **Drug Input**: Use autocomplete to select "Lisinopril"
2. **SIG**: Enter "Take 1 tablet in the morning and 1 at bedtime"
3. **Days Supply**: Enter 30
4. **Filters**:
   - Dosage Form: Select "Tablet"
   - Strength: Enter "20mg"
5. **Insurance**: Check "Check Insurance Coverage"
   - Insurance Plan: "Blue Cross Blue Shield"
6. **Interactions**: Check "Check Drug Interactions"
   - Known Allergies: "Penicillin"
   - Patient Conditions: "Hypertension"
7. Click "Calculate"

**Expected Results:**
- ✅ Drug autocomplete works
- ✅ Complex SIG parsed correctly (2 tablets/day)
- ✅ Only tablet NDCs shown
- ✅ Only 20mg NDCs shown
- ✅ Insurance coverage checked
- ✅ Allergy/contraindication checks performed
- ✅ Total quantity: 60 tablets (2 × 30)
- ✅ Package recommendations shown
- ✅ All warnings displayed

---

## Testing with NDC Codes

**Test Direct NDC Input:**

1. Enter NDC: "68180-981" (or "68180981")
2. Enter SIG: "Take 1 tablet twice daily"
3. Enter Days Supply: 30
4. Click "Calculate"

**Expected Results:**
- ✅ NDC detected automatically
- ✅ Product information retrieved from FDA
- ✅ Package size shown
- ✅ Quantity calculated

**Test NDC Codes:**
- `68180-981` - Lisinopril
- `0591-0885` - Metformin (8-digit format)
- `68180-981-01` - Package-level NDC (11-digit)

---

## Error Handling Tests

### Invalid NDC
1. Enter NDC: "99999-9999-99"
2. Enter SIG and Days Supply
3. Click "Calculate"

**Expected**: Error message "NDC code not found" with suggestion

### Invalid Drug Name
1. Enter Drug: "Xyzabc123"
2. Enter SIG and Days Supply
3. Click "Calculate"

**Expected**: Error message with suggestion to check spelling or use NDC

### Missing Fields
1. Leave Drug Name empty
2. Click "Calculate"

**Expected**: Validation error "Please enter a drug name or NDC"

---

## Browser Testing Checklist

### Visual Testing
- [ ] Page loads correctly
- [ ] Form fields are visible and styled
- [ ] Filter panel appears correctly
- [ ] Results display properly
- [ ] Warnings are color-coded (high=red, medium=yellow, low=blue)
- [ ] Loading states show spinner
- [ ] Error messages are clear

### Functionality Testing
- [ ] Autocomplete dropdown appears
- [ ] Keyboard navigation works
- [ ] Form validation works
- [ ] Calculate button triggers calculation
- [ ] Clear button resets form
- [ ] Results update correctly
- [ ] Warnings display appropriately

### Responsive Testing
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Form fields stack correctly on mobile
- [ ] Filter panel is accessible on all sizes

---

## Performance Testing

### Load Time
- [ ] Initial page load < 2 seconds
- [ ] Autocomplete suggestions appear < 500ms
- [ ] Calculation completes < 5 seconds

### API Calls
- [ ] Check browser Network tab
- [ ] Verify API calls are made correctly
- [ ] Check for unnecessary duplicate calls
- [ ] Verify error handling for failed API calls

---

## Console Testing

**Open Browser DevTools (F12) and check:**

1. **No Errors**: Console should be clean (no red errors)
2. **API Logs**: In development mode, you'll see:
   - RxNorm API calls
   - FDA API calls
   - Calculation logs
3. **Warnings**: Check for any console warnings

---

## Sample Test Data

### Simple Test
```
Drug: Lisinopril
SIG: Take 1 tablet twice daily
Days Supply: 30
Expected: 60 tablets
```

### Complex SIG Test
```
Drug: Amoxicillin
SIG: Take 1-2 tablets as needed for pain
Days Supply: 7
Expected: Estimated quantity (PRN)
```

### Filter Test
```
Drug: Omeprazole
SIG: Take 1 capsule daily
Days Supply: 30
Dosage Form: Capsule
Strength: 20mg
Expected: Only 20mg capsule NDCs
```

### Insurance Test
```
Drug: Lisinopril
SIG: Take 1 tablet twice daily
Days Supply: 30
Check Insurance: Yes
Insurance Plan: Blue Cross
Expected: Coverage warnings if applicable
```

### Interaction Test
```
Drug: Lisinopril
SIG: Take 1 tablet twice daily
Days Supply: 30
Check Interactions: Yes
Allergies: Penicillin
Conditions: Pregnancy
Expected: Contraindication warning (ACE inhibitor in pregnancy)
```

---

## Troubleshooting

### Autocomplete Not Working
- Check browser console for errors
- Verify `/api/drug-search` endpoint is accessible
- Check network tab for API calls

### Filters Not Working
- Verify filter values are being sent in API request
- Check browser Network tab for request payload
- Verify API is processing filters correctly

### Warnings Not Showing
- Check if warnings are in API response
- Verify warning types are handled in UI
- Check browser console for errors

### Calculation Errors
- Verify all required fields are filled
- Check API response for error details
- Review browser console for errors

---

## Next Steps

After testing:
1. Document any bugs found
2. Note any missing features
3. Suggest improvements
4. Test edge cases
5. Verify all warning types display correctly

---

## Quick Test Commands

```bash
# Start dev server
npm run dev

# Check for TypeScript errors
npm run check

# Build for production (test build)
npm run build
```

Happy Testing! 🧪

