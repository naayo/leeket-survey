# 🔐 Survey Closure Management Guide

## Quick Actions

### To Close the Survey Immediately:
1. Open `survey-config.js`
2. Change `status: 'open'` to `status: 'closed'`
3. Commit and push changes
4. Survey will show closure screen immediately

### To Set Automatic Closure Date:
1. Open `survey-config.js`
2. Set `closureDate: '2024-12-31T23:59:59'` (your desired date/time)
3. Survey will auto-close at that time

### To Close After Target Responses:
1. Open `survey-config.js`  
2. Set `targetResponses: 1000` (your target number)
3. Survey will close when reaching that many responses

## Testing Closure Screen

### Test Without Actually Closing:
```javascript
// In survey-config.js
forceClosed: true  // Shows closure screen (for testing)
forceOpen: false   // Normal behavior
```

### Force Survey Open (Emergency):
```javascript
// In survey-config.js
forceOpen: true    // Keeps survey open regardless of other settings
forceClosed: false // Normal behavior
```

## Customizing Closure Messages

Edit in `survey-config.js`:
```javascript
messages: {
    closureTitle: "✓ Merci pour votre participation !",
    closureMessage: "Le formulaire est maintenant clos.",
    closureSubtext: "Vos réponses nous aident...",
    closureFooter: "Rendez-vous très bientôt...",
    closureContact: "Pour plus d'informations : contact@leeket.sn"
}
```

## Closure Priority Order

1. **forceClosed** (if true) - Testing override
2. **forceOpen** (if true) - Emergency override  
3. **status === 'closed'** - Manual closure
4. **closureDate** passed - Automatic date closure
5. **targetResponses** reached - Automatic count closure

## Monitoring

- Current responses: Check Google Sheets "Responses" tab
- View count: Row count minus header row
- Hot leads: Check "Hot Leads" tab
- Diaspora: Check "Diaspora" tab

## Reopening Survey

1. Set `status: 'open'`
2. Set `forceClosed: false`
3. Clear or update `closureDate` if set
4. Increase `targetResponses` if needed
5. Commit and push changes

## Troubleshooting

### Closure screen not showing:
- Check browser console for errors
- Verify survey-config.js is loaded
- Check if forceClosed is set for testing
- Clear browser cache

### Wrong response count:
- Check Google Sheets for actual count
- API endpoint: `YOUR_SCRIPT_URL?action=getStats`
- Verify Google Script is deployed correctly

### Messages not updating:
- Hard refresh page (Ctrl+F5)
- Check survey-config.js syntax
- Verify file is committed and deployed