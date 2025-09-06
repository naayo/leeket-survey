# 🚀 Netlify Deployment Guide for Leeket Survey

## ✅ Prerequisites Completed
- ✅ Git repository initialized
- ✅ All files committed
- ✅ Google Sheets script URL configured in survey.js

## 📋 Deployment Steps

### Step 1: Create GitHub Repository (3 min)

1. Go to [GitHub.com](https://github.com)
2. Click **"New repository"** (green button)
3. Name it: `leeket-survey`
4. Keep it **Public** (for free Netlify deployment)
5. **DON'T** initialize with README (we already have one)
6. Click **"Create repository"**

7. In your terminal, run these commands:
```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/leeket-survey.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Netlify (5 min)

#### Option A: Via Netlify Website (Easiest)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Sign up/Login (use GitHub for easy connection)
3. Click **"Add new site"** → **"Import an existing project"**
4. Choose **GitHub**
5. Select your `leeket-survey` repository
6. Configure build settings:
   - **Base directory**: Leave empty
   - **Build command**: Leave empty (we're not building)
   - **Publish directory**: `.` (just a dot)
7. Click **"Deploy site"**

#### Option B: Via Netlify CLI (Faster)

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy directly:
```bash
# From your project directory
netlify deploy --prod
```

4. Follow prompts:
   - Create & configure a new site
   - Team: Choose your team
   - Site name: `leeket-survey` (or leave blank for random)

### Step 3: Configure Environment Variable (2 min)

Since you have the Google Script URL directly in survey.js, you can skip this step!

But if you want to use environment variables (more secure):

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add:
   - **Key**: `GOOGLE_SCRIPT_URL`
   - **Value**: `https://script.google.com/macros/s/AKfycbxTrEqoLprfcDNVNdbIC-ZIIpg_wTtoNk5Ux3l9Has/exec`
4. Click **"Save"**

### Step 4: Update Your Form (1 min)

Since you already have the Google Script URL in your survey.js, you need to:

1. Edit `survey.js` line 2:
```javascript
// Change from /dev to /exec
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTrEqoLprfcDNVNdbIC-ZIIpg_wTtoNk5Ux3l9Has/exec';
```

2. Update the fetch call (line 284) to use Google Sheets directly:
```javascript
// Option 1: Direct to Google Sheets (skip Netlify function)
const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',  // Important for Google Scripts!
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
});

// Since no-cors, we can't read response, so assume success
form.style.display = 'none';
document.querySelector('.progress-container').style.display = 'none';
loading.style.display = 'none';
successMessage.style.display = 'block';

// Option 2: Keep using Netlify function (current setup)
// No changes needed, it will work as is
```

3. Commit and push changes:
```bash
git add survey.js
git commit -m "Update Google Script URL to production endpoint"
git push
```

### Step 5: Your Site is Live! 🎉

Your site will be available at:
- **Netlify URL**: `https://YOUR-SITE-NAME.netlify.app`
- **Custom domain**: Can be added in Netlify settings

## 🧪 Test Your Deployment

1. Visit your Netlify URL
2. Fill out the form with test data
3. Submit the form
4. Check your Google Sheet - data should appear immediately!

## 📊 Monitoring

### In Netlify Dashboard:
- **Functions** tab: See function logs (if using Netlify function)
- **Analytics** tab: See form submissions
- **Deploys** tab: See deployment history

### In Google Sheets:
- Check the **Responses** sheet for new entries
- View **Analytics** tab for live metrics
- Monitor **Hot Leads** sheet for high-value prospects

## 🔧 Troubleshooting

### Form not submitting?
1. Check browser console for errors (F12)
2. Verify Google Script URL ends with `/exec` not `/dev`
3. Make sure Google Script is deployed as "Anyone can access"

### Data not appearing in Google Sheets?
1. Check Google Apps Script logs:
   - Open Apps Script editor
   - View → Execution transcript
2. Verify script permissions are set correctly
3. Test the script URL directly in browser (should show status message)

### CORS errors?
- Use `mode: 'no-cors'` in fetch request
- Or use the Netlify function approach

## 🚀 Quick Deploy Commands

```bash
# After making changes
git add .
git commit -m "Update survey"
git push

# Netlify auto-deploys from GitHub!
```

## 📱 Share Your Survey

Once deployed, share your survey link:
```
https://leeket-survey.netlify.app
```

Or with custom domain:
```
https://survey.leeket.sn
```

## 🎯 Next Steps

1. **Test with real users**: Share with 5-10 testers first
2. **Monitor responses**: Check Google Sheets regularly
3. **Analyze data**: Use the Analytics tab
4. **Export hot leads**: Download CSV for CRM import
5. **Scale**: When you hit 1000 responses, consider upgrading

## 💡 Pro Tips

- **Auto-deploy**: Every push to GitHub auto-deploys to Netlify
- **Preview deploys**: Pull requests get preview URLs
- **Form notifications**: Set up email alerts in Google Sheets
- **Analytics**: Connect Google Analytics for traffic data
- **A/B testing**: Use Netlify Split Testing feature

---

## ✅ Deployment Checklist

- [ ] Git repository created
- [ ] Pushed to GitHub
- [ ] Netlify account created
- [ ] Site deployed
- [ ] Google Script URL updated to `/exec`
- [ ] Test submission successful
- [ ] Google Sheet receiving data
- [ ] Share link with team

Your survey is now live and collecting responses! 🎉