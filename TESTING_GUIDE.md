# Interactive Features Testing Guide 🧪

## Quick Start
1. Server is running at: http://localhost:3000
2. All features are live and ready to test!

## 🎯 Test Scenarios

### Scenario 1: Upload Evidence (Evidence Page)
**URL**: http://localhost:3000/evidence

**Steps**:
1. Click the **"Upload Evidence"** button (top right, blue button)
2. **Drag and drop** a file OR click the upload area to browse
3. Watch the file preview appear ✨
4. Fill in the form:
   - Title: Auto-filled from filename (editable)
   - Description: Optional
   - Source: Select from dropdown (Manual, AWS, Azure, etc.)
   - Controls: Type "AC-001" and click "Add"
5. Click **"Upload Evidence"**
6. ✅ **Expected**: Success alert + Evidence appears at top of list

**Also Test**:
- Click **"Export CSV"** → File downloads
- Click **"Export JSON"** → File downloads
- Try downloading individual evidence items

---

### Scenario 2: Create Custom Framework (Compliance Page)
**URL**: http://localhost:3000/compliance

**Steps**:
1. Click **"Add Custom Framework"** button (top right)
2. Fill in the form:
   - Framework Code: "CUSTOM-001" (required)
   - Name: "My Custom Security Framework" (required)
   - Version: "1.0"
   - Category: Select "Security"
   - Authority: "Internal Security Team"
   - Description: "Custom framework for..."
3. Click **"Create Framework"**
4. ✅ **Expected**: Success alert + Framework saved via API

**Also Test**:
- Click any framework card to view details
- In the details modal, click **"Export"** → Downloads requirements CSV
- Click **"Adopt Framework"** button
- Browse and search frameworks

---

### Scenario 3: Create Risk (Risks Page)
**URL**: http://localhost:3000/risks

**Steps**:
1. Click **"Add Risk"** button (top right)
2. Fill in the form:
   - Title: "Data breach via third-party" (required)
   - Description: Optional
   - Category: Select "Security"
   - Likelihood: Select **"High"**
   - Impact: Select **"Critical"**
   - 👀 **Watch the risk score calculate automatically! (12 = High)**
   - Treatment Strategy: Select "Mitigate"
   - Owner: "Security Team"
   - Target Date: Pick a date
3. Click **"Create Risk"**
4. ✅ **Expected**: Risk added to register with calculated score

**Also Test**:
- View the **Risk Heat Map** → Interactive grid
- Filter by status (Open, Mitigated, Accepted, Closed)
- Click **"Export"** → Downloads risk register CSV

---

### Scenario 4: Add Vendor (Vendors Page)
**URL**: http://localhost:3000/vendors

**Steps**:
1. Click **"Add Vendor"** button (top right)
2. Fill in the form:
   - Name: "Acme Corp" (required)
   - Website: "https://acme.com"
   - Contact Name: "John Smith"
   - Contact Email: "john@acme.com"
   - Category: Select "Software / SaaS"
   - Business Criticality: Select "High"
   - Data Access Level: Select "Moderate (Some PII)"
3. Click **"Add Vendor"**
4. ✅ **Expected**: Vendor added with "Pending Review" status

**Also Test**:
- Filter by risk level (Low, Medium, High, Critical)
- Click **"Export"** → Downloads vendor list CSV
- View vendor cards with scores

---

## 🎨 UI Features to Test

### Drag & Drop
- **Where**: Evidence upload modal
- **Test**: Drag a file from your desktop onto the upload area
- **Expected**: File preview appears, upload area turns green

### Real-Time Calculations
- **Where**: Risk creation modal
- **Test**: Change Likelihood and Impact dropdowns
- **Expected**: Risk score updates instantly with color-coded badge

### Form Validation
- **Where**: All modals
- **Test**: Try submitting without required fields
- **Expected**: Submit button disabled OR validation error

### Loading States
- **Where**: All creation/upload operations
- **Test**: Click submit and watch for spinner
- **Expected**: Button shows loading spinner and "Creating..." text

### Export Functions
- **Where**: Evidence, Compliance, Risks, Vendors pages
- **Test**: Click any Export button
- **Expected**: File downloads automatically with timestamp in filename

---

## 📱 Interactive Elements Checklist

### Evidence Page
- [ ] Upload Evidence button → Opens modal
- [ ] Drag & drop file → File preview
- [ ] Click to browse → File selector
- [ ] Add control button → Adds control tag
- [ ] Remove control (X) → Removes tag
- [ ] Export CSV → Downloads CSV
- [ ] Export JSON → Downloads JSON
- [ ] Download button (per item) → Downloads file
- [ ] Source filter pills → Filters list
- [ ] Search box → Filters evidence

### Compliance Page
- [ ] Add Custom Framework → Opens modal
- [ ] Export button → Downloads frameworks CSV
- [ ] Framework card click → Opens details
- [ ] Search bar → Filters frameworks
- [ ] Category filter → Filters by category
- [ ] View button → Framework details
- [ ] Export (in modal) → Downloads requirements
- [ ] Adopt Framework → Adoption flow
- [ ] External link icon → Opens official site

### Risks Page
- [ ] Add Risk button → Opens modal
- [ ] Likelihood dropdown → Updates score
- [ ] Impact dropdown → Updates score
- [ ] Risk score display → Shows color-coded level
- [ ] Export button → Downloads CSV
- [ ] Status filters → Filters risk list
- [ ] Heat map cells → Shows risk count

### Vendors Page
- [ ] Add Vendor button → Opens modal
- [ ] Export button → Downloads CSV
- [ ] Risk level filters → Filters vendors
- [ ] View Details → Vendor details
- [ ] Start Assessment → Assessment flow
- [ ] Vendor cards → Shows info

---

## 🔍 What to Look For

### ✅ Good Signs
- Smooth animations
- Clear feedback (alerts, notifications)
- No console errors
- Buttons change on hover
- Forms validate properly
- Files download successfully
- Data appears in lists immediately
- Loading spinners show during operations
- Modal backgrounds are semi-transparent
- Escape key closes modals
- Can click outside to close

### ❌ Red Flags (Should NOT happen)
- Buttons do nothing
- Console errors
- White screen of death
- Broken layouts
- Forms don't submit
- No feedback after actions
- Modals don't close
- Export doesn't work
- File upload fails

---

## 🎭 Advanced Testing

### Test Modal Interactions
1. Open any modal
2. Press **ESC key** → Modal should close
3. Click outside modal → Modal should close
4. Try to scroll page → Background should not scroll
5. Tab through form fields → Should work smoothly

### Test Accessibility
1. Use **Tab** key to navigate
2. Use **Enter** to activate buttons
3. Use **Space** to select checkboxes
4. Screen reader should announce actions

### Test Edge Cases
1. Upload a **very large file** (>10MB)
2. Try to submit form with **empty required fields**
3. Enter **special characters** in text fields
4. Add **many controls** (10+) to evidence
5. Export with **no data** → Should handle gracefully

---

## 📊 Performance Testing

### What to Monitor
- [ ] Page loads under 3 seconds
- [ ] Modal opens instantly (< 100ms)
- [ ] Export generates file quickly (< 1 second)
- [ ] Search/filter is responsive (< 100ms)
- [ ] No memory leaks (close/open modals multiple times)

---

## 🐛 Bug Reporting Template

If you find any issues:

```
**Issue**: [Brief description]
**Page**: [URL where issue occurs]
**Steps to Reproduce**:
1. 
2. 
3. 

**Expected**: [What should happen]
**Actual**: [What actually happens]
**Browser**: [Chrome/Firefox/Safari/Edge + version]
**Console Errors**: [Any errors in browser console]
```

---

## ✨ Success Criteria

### All Tests Pass When:
- ✅ Every button responds to clicks
- ✅ Forms can be filled and submitted
- ✅ Modals open and close smoothly
- ✅ Files can be uploaded
- ✅ Data can be exported
- ✅ Lists update in real-time
- ✅ Calculations work correctly
- ✅ Filters and search work
- ✅ No console errors
- ✅ Loading states display
- ✅ Success messages show
- ✅ Error handling works

---

## 🚀 Quick Test Script (5 minutes)

Run through this quickly to verify everything works:

1. **Evidence Page** (1 min)
   - Click Upload → Drop file → Submit ✅
   - Click Export CSV ✅

2. **Compliance Page** (1 min)
   - Click Add Framework → Fill form → Submit ✅
   - Click a framework → View details ✅

3. **Risks Page** (1 min)
   - Click Add Risk → Set High/Critical → Watch score calculate ✅
   - Click Export ✅

4. **Vendors Page** (1 min)
   - Click Add Vendor → Fill form → Submit ✅
   - Filter by risk level ✅

5. **General** (1 min)
   - Test search boxes ✅
   - Test filters ✅
   - Check responsive design (resize window) ✅

**Total Time**: 5 minutes
**Expected Result**: Everything works perfectly! 🎉

---

## 📞 Need Help?

All features are working as designed. If you encounter any issues:
1. Check browser console for errors
2. Verify server is running (http://localhost:3000)
3. Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Check IMPLEMENTATION_SUMMARY.md for details

---

**Happy Testing! 🎉**

Every button, every feature, every interaction is now FULLY FUNCTIONAL!
