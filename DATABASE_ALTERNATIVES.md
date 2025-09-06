# Database Alternatives for Leeket Survey

## Alternative Database Solutions

### 1. **Google Sheets** (Easiest & Free)
**Pros:**
- Completely free
- Easy setup
- Good for up to 10,000 responses
- Built-in sharing and collaboration

**Implementation:**
```javascript
// Replace submit-survey.js with Google Sheets version
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
```

**Setup Guide:**
1. Create Google Sheet with all columns
2. Go to Extensions → Apps Script
3. Deploy as Web App
4. Use the Web App URL in your code

---

### 2. **Supabase** (Best Free Tier)
**Pros:**
- Generous free tier (500MB, 50,000 rows)
- Real PostgreSQL database
- Built-in authentication
- Real-time subscriptions
- REST API included

**Implementation:**
```javascript
// netlify/functions/submit-survey-supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// In handler function:
const { data, error } = await supabase
    .from('responses')
    .insert([formattedData]);
```

**Setup:**
```bash
npm install @supabase/supabase-js
```

---

### 3. **MongoDB Atlas** (Best for Scale)
**Pros:**
- 512MB free tier
- NoSQL flexibility
- Great for unstructured data
- Scales well

**Implementation:**
```javascript
// netlify/functions/submit-survey-mongodb.js
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);

// In handler function:
await client.connect();
const database = client.db('leeket');
const collection = database.collection('responses');
await collection.insertOne(formData);
```

**Setup:**
```bash
npm install mongodb
```

---

### 4. **Firebase Firestore** (Best for Real-time)
**Pros:**
- Generous free tier
- Real-time updates
- Offline support
- Google infrastructure

**Implementation:**
```javascript
// netlify/functions/submit-survey-firebase.js
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
    })
});

const db = admin.firestore();

// In handler function:
await db.collection('responses').add(formData);
```

---

### 5. **Notion API** (Best for Team Collaboration)
**Pros:**
- Great UI for non-technical team
- Built-in views and filters
- Comments and collaboration
- Free for personal use

**Implementation:**
```javascript
// netlify/functions/submit-survey-notion.js
const { Client } = require('@notionhq/client');

const notion = new Client({
    auth: process.env.NOTION_TOKEN
});

// In handler function:
await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: formatForNotion(formData)
});
```

---

### 6. **Netlify Blobs** (Simplest - No External Service)
**Pros:**
- Built into Netlify
- No external service needed
- Simple key-value storage
- Free tier included

**Implementation:**
```javascript
// netlify/functions/submit-survey-blobs.js
import { getStore } from "@netlify/blobs";

export default async (req) => {
    const store = getStore("survey-responses");
    const id = Date.now().toString();
    await store.set(id, JSON.stringify(formData));
};
```

---

## Comparison Table

| Solution | Free Tier | Setup Difficulty | Best For | Limitations |
|----------|-----------|-----------------|----------|-------------|
| **Google Sheets** | Unlimited* | Very Easy | Small projects | 10M cells total |
| **Supabase** | 500MB | Easy | Full-featured apps | 50K rows free |
| **MongoDB** | 512MB | Medium | Large datasets | Requires more code |
| **Firebase** | 1GB storage | Medium | Real-time apps | Complex pricing |
| **Notion** | Personal free | Easy | Team collaboration | API rate limits |
| **Netlify Blobs** | 1GB | Very Easy | Simple storage | No querying |
| **Airtable** | 1,200 records | Easy | Visual database | Limited free tier |

---

## Recommended Solution for Leeket

### For MVP (< 1000 responses):
**Use Google Sheets**
- Zero cost
- Easy for team to view data
- Quick setup
- Export to CSV anytime

### For Production (> 1000 responses):
**Use Supabase**
- PostgreSQL power
- Scalable
- Built-in auth for admin panel
- Can build analytics dashboard

---

## Quick Implementation: Google Sheets

### 1. Create Google Apps Script
```javascript
// Code.gs in Google Apps Script
function doPost(e) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Add timestamp
    data.timestamp = new Date();
    
    // Calculate lead score
    const leadScore = calculateLeadScore(data);
    data.leadScore = leadScore;
    data.segment = getSegment(leadScore);
    
    // Append row
    const row = [
        data.timestamp,
        data.quartier,
        data.age,
        data.foyer_size,
        data.profession,
        // ... add all fields
        data.leadScore,
        data.segment
    ];
    
    sheet.appendRow(row);
    
    return ContentService
        .createTextOutput(JSON.stringify({
            success: true,
            leadScore: leadScore
        }))
        .setMimeType(ContentService.MimeType.JSON);
}
```

### 2. Update your submit function
```javascript
// survey.js
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(data)
});
```

---

## Migration Path

Start with → Scale to:
- **Google Sheets** → Supabase (export CSV, import to Supabase)
- **Netlify Blobs** → MongoDB (write migration script)
- **Notion** → Any SQL database (export CSV)

---

## Need Help Choosing?

Answer these questions:
1. **Budget?** → If $0, use Google Sheets or Supabase
2. **Expected responses?** → <1000: Sheets, >1000: Supabase/MongoDB
3. **Team technical skill?** → Low: Sheets/Notion, High: Any
4. **Need real-time?** → Firebase or Supabase
5. **Need advanced queries?** → PostgreSQL (Supabase) or MongoDB