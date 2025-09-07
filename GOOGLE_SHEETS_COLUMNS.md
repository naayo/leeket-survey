# Google Sheets Required Columns

## Essential Columns for Promo Code System

Add these columns to your Google Sheets (in addition to existing survey fields):

### Promo Code Columns (REQUIRED)
| Column Name | Description | Example Value |
|------------|-------------|---------------|
| `promo_code` | Unique promo code | LK4567AB2C |
| `code_status` | Current status of code | active |
| `code_value` | Discount value in FCFA | 2000 |
| `code_expiry` | Expiration date (ISO format) | 2025-07-01T12:00:00.000Z |

### Additional Tracking Columns (RECOMMENDED)
| Column Name | Description | Example Value |
|------------|-------------|---------------|
| `code_used` | Whether code has been used | FALSE |
| `code_used_date` | Date when code was used | (empty until used) |
| `sms_reminder_sent` | Date when launch SMS was sent | (empty until sent) |
| `app_downloaded` | Whether user downloaded app | FALSE |
| `first_order_id` | ID of first order | (empty until ordered) |
| `first_order_date` | Date of first order | (empty until ordered) |

### All Survey Data Fields Being Sent

#### Basic Information
- `timestamp` - Submission date/time
- `localisation` - senegal or etranger
- `quartier` - Neighborhood (or "Diaspora" for diaspora users)
- `diaspora_region` - Region for diaspora users
- `age` - Age range
- `foyer_size` - Household size
- `profession` - Professional status
- `telephone` - Phone number (cleaned)
- `email` - Email address (optional)
- `prenom` - First name (optional)
- `beta_tester` - Boolean (true/false)

#### Shopping Habits (Sections 2-7, skipped for diaspora)
- `lieu_courses` - Shopping locations
- `frequence` - Shopping frequency
- `budget_hebdo` - Weekly budget
- `defis` - Shopping challenges
- `plats` - Preferred dishes
- `freq_cuisine` - Cooking frequency
- `qui_cuisine` - Who cooks
- `delai_commande` - Order delay preference
- `commande_auto` - Auto order interest
- `interet` - Interest score (1-5)
- `avantages_anticipe` - Expected advantages
- `delai_ideal` - Ideal delay
- `attrait` - Attractions
- `service_prefere` - Preferred service
- `prix_min_pack` - Min pack price
- `prix_max_pack` - Max pack price
- `prix_livraison` - Delivery price
- `frequence_usage` - Usage frequency
- `panier_moyen` - Average basket
- `suggestions` - Suggestions
- `inquietudes` - Concerns

#### Diaspora Specific (Section 8-9)
- `zones_famille` - Family zones in Senegal
- `fonctionnalites_essentielles` - Essential features
- `types_produits` - Product types interested in
- `preference_commande` - Order preference
- `frais_service_diaspora` - Service fee willingness
- `freq_utilisation_diaspora` - Usage frequency
- `nombre_beneficiaires` - Number of households to help (1, 2, 3-4, 5+)

#### Section 10 (Suggestions)
- `services_manquants` - Missing services (diaspora)
- `difficultes_diaspora` - Difficulties (diaspora)
- `fonctionnalites_innovantes` - Innovative features (diaspora)
- `recommandation_diaspora` - Would recommend (diaspora)
- `suggestions_amelioration` - Improvement suggestions (local)
- `services_souhaites` - Desired services (local)
- `recommandation_locale` - Would recommend (local)

## Google Apps Script Setup

Make sure your Google Apps Script handles these fields properly:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  // Add row with all fields including promo code fields
  sheet.appendRow([
    new Date(), // Timestamp
    data.telephone,
    data.email,
    data.promo_code,      // NEW
    data.code_status,     // NEW
    data.code_value,      // NEW
    data.code_expiry,     // NEW
    // ... all other fields ...
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Important Notes

1. **Column Order**: The order must match your Google Apps Script
2. **Data Types**: 
   - Numbers: code_value should be formatted as number
   - Dates: timestamp and code_expiry should be formatted as dates
   - Booleans: beta_tester, code_used should be TRUE/FALSE
3. **Formulas**: You can add calculated columns like:
   - Days until expiry: `=DAYS(code_expiry, TODAY())`
   - Lead score calculation
   - Segment classification

## For App Integration

When launching your app, export this sheet and import to your database:
- Primary key: `telephone` or `promo_code`
- Index on: `promo_code`, `code_status`
- Validate: `code_expiry > NOW()` and `code_status = 'active'`