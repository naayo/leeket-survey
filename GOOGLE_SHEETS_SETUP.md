# 📊 Google Sheets Setup Guide for Leeket Survey

## ⏱️ Time Required: 10 minutes

## Step 1: Create Your Google Sheet (2 min)

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **"+ Blank"** to create a new spreadsheet
3. Name it: **"Leeket Survey Responses"**
4. Keep this tab open

## Step 2: Add the Apps Script (3 min)

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code in the editor
3. Copy ALL the code from `google-sheets-script.gs` file
4. Paste it in the Apps Script editor
5. Click **💾 Save** (Ctrl+S or Cmd+S)
6. Name the project: **"Leeket Survey Script"**

## Step 3: Initialize the Spreadsheet (1 min)

1. In the Apps Script editor, click **Run** button ▶️
2. Select function: **`setupSpreadsheet`**
3. Click **Run**
4. Grant permissions when prompted:
   - Click **Review permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to Leeket Survey Script (unsafe)**
   - Click **Allow**
5. You should see "✅ Spreadsheet setup complete!"

## Step 4: Deploy as Web App (2 min)

1. In Apps Script, click **Deploy → New Deployment**
2. Click the gear ⚙️ → **Web app**
3. Configure:
   - **Description**: "Leeket Survey API v1"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** ⚠️ Important!
4. Click **Deploy**
5. **COPY THE WEB APP URL** - You'll need this!
   ```
   Example: https://script.google.com/macros/s/AKfycbw.../exec
   ```

## Step 5: Update Your Form (2 min)

### Option A: Using Netlify (Recommended)

1. Add to your Netlify environment variables:
   ```
   GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

2. Update `netlify.toml`:
   ```toml
   [build]
     functions = "netlify/functions"
   
   [functions]
     node_bundler = "esbuild"
   ```

3. Rename function in Netlify:
   ```bash
   mv netlify/functions/submit-survey.js netlify/functions/submit-survey-airtable.js
   mv netlify/functions/submit-survey-googlesheets.js netlify/functions/submit-survey.js
   ```

### Option B: Direct Integration (Simpler)

1. Edit `survey.js` and add at the top:
   ```javascript
   // Replace with your Google Script URL
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```

2. Replace the fetch call in form submission:
   ```javascript
   // Old Netlify function call
   // const response = await fetch('/.netlify/functions/submit-survey', {

   // New direct Google Sheets call
   const response = await fetch(GOOGLE_SCRIPT_URL, {
       method: 'POST',
       mode: 'no-cors',  // Important!
       headers: {
           'Content-Type': 'application/json',
       },
       body: JSON.stringify(data)
   });
   
   // Since no-cors mode, assume success
   // Show success message
   form.style.display = 'none';
   document.querySelector('.progress-container').style.display = 'none';
   loading.style.display = 'none';
   successMessage.style.display = 'block';
   ```

## ✅ Your Spreadsheet Now Has:

### 4 Sheets Created Automatically:
1. **📊 Responses** - All survey data with 48 columns
2. **📈 Analytics** - Live dashboard with metrics
3. **🔥 Hot Leads** - Auto-filtered hot leads (score 70+)
4. **🌍 Diaspora** - Auto-filtered diaspora members

### Automatic Features:
- ✅ Lead scoring (0-100)
- ✅ Segment classification (Hot/Warm/Cold)
- ✅ Promo code generation
- ✅ Timestamp tracking
- ✅ Color-coded by lead quality
- ✅ Weekly/monthly grouping

## 📱 View Your Data

### On Desktop:
1. Open your Google Sheet
2. Check the **Analytics** tab for dashboard
3. Use **Data → Filter views** for custom filters

### On Mobile:
1. Download **Google Sheets** app
2. Open your spreadsheet
3. Swipe between sheets to see different views

## 📊 Quick Analysis Formulas

Add these to any cell for instant insights:

```excel
// Total hot leads from Almadies
=COUNTIFS(Responses!F:F,"Almadies",Responses!C:C,">=70")

// Average interest score
=AVERAGE(Responses!V:V)

// Diaspora percentage
=COUNTIF(Responses!AI:AI,"oui")/COUNTA(Responses!AI:AI)

// Top 5 quartiers
=QUERY(Responses!A:AW,"SELECT F, COUNT(F) WHERE F != 'Quartier' GROUP BY F ORDER BY COUNT(F) DESC LIMIT 5")
```

## 🔧 Troubleshooting

### "Script not found" error:
- Make sure you deployed as "Web app"
- Check URL includes `/exec` at the end
- Verify "Anyone" has access

### Data not appearing:
- Check Google Sheet permissions
- Verify script is saved and deployed
- Look for errors in Apps Script logs (View → Logs)

### CORS errors:
- Use `mode: 'no-cors'` in fetch
- Or use the Netlify function approach

## 🎯 Test Your Setup

1. Submit a test response through your form
2. Check your Google Sheet - data should appear instantly
3. Check the Analytics tab for updated metrics

## 📈 Next Steps

### Add Charts:
1. Select data range
2. Insert → Chart
3. Choose chart type
4. Customize colors to green theme

### Share Dashboard:
1. Click **Share** button
2. Get shareable link
3. Set to "Anyone with link can view"
4. Share with team!

### Export Data:
- **File → Download → CSV** for Excel
- **File → Download → PDF** for reports
- Connect to **Google Data Studio** for advanced dashboards

## 🆘 Need Help?

Common issues:
1. **Permissions**: Make sure Web App is set to "Anyone"
2. **URL**: Must end with `/exec` not `/dev`
3. **CORS**: Use `no-cors` mode or Netlify function

---

## 🎉 Congratulations!

Your survey is now connected to Google Sheets with:
- ✅ Free unlimited responses
- ✅ Automatic lead scoring
- ✅ Live analytics dashboard
- ✅ Mobile access
- ✅ Team sharing
- ✅ Export capabilities

No monthly fees, no limits, full control! 🚀