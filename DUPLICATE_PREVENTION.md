# 🔒 Duplicate Prevention System

## How It Works

### 1. **Server-Side Validation (Google Sheets)**
When a form is submitted, the Google Apps Script:
- Checks all existing responses for matching phone number (spaces removed)
- Checks all existing responses for matching email (case-insensitive)
- If duplicate found, returns the existing promo code with a warning

### 2. **Matching Rules**
```javascript
// Phone Match (Primary - Required Field)
- Removes all spaces: "77 123 45 67" = "771234567"
- Exact match required
- This is the primary duplicate check

// Email Match (Secondary - Optional Field)
- Case insensitive: "User@Email.com" = "user@email.com"
- Only checked if email provided
```

### 3. **User Experience**

#### First Submission:
✅ Form submitted normally
✅ New promo code generated
✅ Success message shown
✅ Data saved to Google Sheets

#### Duplicate Submission:
⚠️ Form submission blocked
⚠️ Warning message displayed
✅ Original promo code shown
ℹ️ Shows how many days ago they participated
❌ No new row added to Google Sheets

### 4. **Response Messages**

#### Duplicate Phone Number:
```
⚠️ Participation déjà enregistrée
Vous avez déjà participé au sondage il y a 5 jour(s).

Votre code promo: LEEKET2ABC3D
Utilisez ce code lors de votre première commande
```

#### Duplicate Email:
```
⚠️ Participation déjà enregistrée
Cette adresse email a déjà été utilisée il y a 3 jour(s).

Votre code promo: LEEKET5XYZ9K
Utilisez ce code lors de votre première commande
```

## Implementation Details

### Google Sheets Script Function:
```javascript
function checkDuplicate(sheet, phone, email) {
  // Scans all rows
  // Returns duplicate info if found
  // Returns null if unique
}
```

### Benefits:
- ✅ **Prevents multiple entries** from same person
- ✅ **Preserves data quality** for analysis
- ✅ **Saves promo codes** (prevents abuse)
- ✅ **User-friendly** - shows existing promo code
- ✅ **Fast** - checks happen server-side

### Edge Cases Handled:
- Phone with/without spaces
- Email case variations
- Empty email field (optional)
- First submission (no data yet)
- Network errors (fallback to local storage)

## Testing Duplicate Prevention

1. **Submit form with phone**: 77 123 45 67
2. **Try again with same phone**: Should show duplicate warning
3. **Try with spaces removed**: 771234567 - Still detected
4. **Try different phone**: Should work normally

## Data Integrity

### What's Tracked:
- First submission timestamp
- Original promo code
- All original responses
- No duplicate rows created

### Analytics Impact:
- Clean data for analysis
- Accurate unique user count
- No inflated response numbers
- True conversion metrics

## Manual Override (Admin Only)

If needed, admins can:
1. Delete duplicate row in Google Sheets
2. User can then resubmit
3. New promo code generated

## Privacy Considerations

- ✅ Phone numbers stored securely in Google Sheets
- ✅ Only accessible to authorized team members
- ✅ No public exposure of personal data
- ✅ Compliant with data protection practices

## Future Enhancements

Possible improvements:
- [ ] Time-based resubmission (allow after 30 days)
- [ ] Update existing response instead of blocking
- [ ] SMS verification for phone numbers
- [ ] Email verification links
- [ ] IP address checking (careful with shared networks)
- [ ] Device fingerprinting (privacy concerns)

## Troubleshooting

### "Already submitted" but user claims first time:
1. Check if they used different phone format
2. Check if family member used same phone
3. Admin can search Google Sheets manually
4. Can delete row if legitimate issue

### Duplicate not detected:
1. Check phone format consistency
2. Verify Google Script is updated
3. Check if script has proper permissions
4. Review Google Sheets for data issues