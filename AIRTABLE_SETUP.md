# Airtable Setup Guide for Diaspora Fields

## New Fields to Add to Your Airtable Base

You need to add these 11 new fields to your existing "Responses" table in Airtable:

### Diaspora Fields Configuration

| Field Name | Field Type | Options/Notes |
|------------|------------|---------------|
| **Est Diaspora** | Single select | Options: `oui`, `non` |
| **Pays Residence** | Single line text | Free text for country |
| **Freq Aide Alimentaire** | Single select | Options: `mensuel`, `trimestriel`, `occasionnel`, `jamais` |
| **Methode Aide Actuelle** | Long text | Multiple values separated by commas |
| **Budget Aide Mensuel** | Single select | Options: `<50`, `50-100`, `100-200`, `200-300`, `300-500`, `500+` |
| **Interet Diaspora** | Number | Integer from 1-5 |
| **Fonctionnalites Diaspora** | Long text | Multiple values separated by commas |
| **Frais Service Diaspora** | Single select | Options: `0`, `5`, `10`, `15`, `fixe` |
| **Freq Utilisation Diaspora** | Single select | Options: `hebdo`, `bimensuel`, `mensuel`, `fetes`, `occasionnel` |
| **Beneficiaire Quartier** | Single line text | Free text for location |
| **Nombre Beneficiaires** | Number | Integer value |

## How to Add Fields in Airtable

1. **Log into your Airtable account**
   - Go to [airtable.com](https://airtable.com)
   - Open your Leeket base

2. **Navigate to your "Responses" table**

3. **Add each field one by one:**
   - Click the `+` button at the right of your last column
   - Select "Add field"
   - Choose the field type from the table above
   - Enter the exact field name (important for API mapping!)
   - For Single select fields, add all the options listed
   - Click "Create field"

4. **Important Notes:**
   - Field names must match EXACTLY as shown above (including spaces and capitalization)
   - For Single select fields, add all options even if they're in French
   - Number fields should accept integers
   - Long text fields will store comma-separated values from checkboxes

## Testing Your Setup

After adding all fields:

1. Create a test record manually in Airtable with sample data
2. Note your Base ID from the URL: `airtable.com/appXXXXXXXXXXXXXX/...`
3. Get your API key from [Account settings](https://airtable.com/account)
4. Test the integration locally with `netlify dev`

## Complete Field List (for reference)

Your table should now have ALL these fields:

### Original Fields:
- Timestamp (Date)
- Quartier (Single line text)
- Age (Single select)
- Taille Foyer (Single line text)
- Profession (Single select)
- Lieux Courses (Long text)
- Frequence Courses (Single select)
- Budget Hebdo (Single select)
- Defis (Long text)
- Plats Préférés (Long text)
- Frequence Cuisine (Single select)
- Qui Cuisine (Single select)
- Delai Commande (Single select)
- Commande Auto (Single select)
- Avantages Anticipe (Long text)
- Delai Ideal (Single select)
- Score Interet (Number)
- Attrait (Long text)
- Service Prefere (Single select)
- Prix Min Pack (Number)
- Prix Max Pack (Number)
- Prix Livraison (Single select)
- Frequence Usage (Single select)
- Panier Moyen (Single select)
- Suggestions (Long text)
- Inquietudes (Long text)
- Telephone (Phone)
- Email (Email)
- Prenom (Single line text)
- Beta Tester (Checkbox)
- Lead Score (Number)
- Segment (Single select: Hot Lead, Warm Lead, Cold Lead)
- Status (Single select: Nouveau, Contacté, Converti)

### New Diaspora Fields (add these):
- Est Diaspora (Single select)
- Pays Residence (Single line text)
- Freq Aide Alimentaire (Single select)
- Methode Aide Actuelle (Long text)
- Budget Aide Mensuel (Single select)
- Interet Diaspora (Number)
- Fonctionnalites Diaspora (Long text)
- Frais Service Diaspora (Single select)
- Freq Utilisation Diaspora (Single select)
- Beneficiaire Quartier (Single line text)
- Nombre Beneficiaires (Number)

## Troubleshooting

If you get errors after deployment:

1. **"Field not found" error**: Check that field names match exactly
2. **"Invalid field type" error**: Verify the field type matches what's expected
3. **"Permission denied" error**: Check your API key has write permissions
4. **Test with a simple record first**: Try submitting just required fields to isolate issues

## Need Help?

- Airtable API Documentation: https://airtable.com/developers/web/api/introduction
- Field Types Guide: https://support.airtable.com/docs/supported-field-types-in-airtable