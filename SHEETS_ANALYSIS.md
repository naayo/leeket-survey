# Google Sheets Analysis Report

## 1. FIELD MAPPING ISSUES FOUND

### Critical Mismatches:
1. **zones_famille** (diaspora) vs **zones_livraison** (local) - Mixed up in sheet columns
2. **interet** field in survey.js should map to "Score Interet" but might be missing
3. **diaspora_region** sent from survey but mapped to "Pays Residence" in sheet
4. **frequence** in survey.js should map to "Frequence Courses"
5. **freq_cuisine** vs "Frequence Cuisine" 
6. **zones_famille** being saved in wrong column position

### Missing Fields in rowData Array:
- Line 494-516 in google-sheets-script.gs has incomplete mapping
- Some diaspora fields are in wrong positions
- Missing: interet_commande_proches, occasions_utilisation at end

## 2. HEADER IMPROVEMENTS NEEDED

### Current Headers → Suggested Improvements:
```
'Timestamp' → 'Date de soumission'
'ID' → 'ID Unique'
'Lead Score' → 'Score Lead (0-100)'
'Segment' → 'Segment Client'
'Status' → 'Statut'

'Promo Code' → 'Code Promo'
'Code Status' → 'Statut Code'
'Code Value (FCFA)' → 'Valeur (FCFA)'
'Code Expiry' → 'Date Expiration'
'Code Used' → 'Code Utilisé'
'Code Used Date' → 'Date Utilisation'

'Localisation' → 'Type Utilisateur'
'Quartier' → 'Quartier/Zone'
'Pays Residence' → 'Pays (Diaspora)'
'Age' → 'Tranche d\'âge'
'Taille Foyer' → 'Taille du foyer'
'Profession' → 'Situation professionnelle'

'Lieux Courses' → 'Lieux d\'achat habituels'
'Frequence Courses' → 'Fréquence courses'
'Budget Hebdo' → 'Budget hebdomadaire'
'Defis' → 'Défis rencontrés'

'Plats Préférés' → 'Plats sénégalais préférés'
'Frequence Cuisine' → 'Fréquence cuisine maison'
'Qui Cuisine' → 'Qui cuisine'

'Delai Commande' → 'Délai commande préféré'
'Commande Auto' → 'Intérêt commande auto'
'Avantages Anticipe' → 'Avantages anticipés'
'Delai Ideal' → 'Délai idéal'

'Score Interet' → 'Intérêt (1-5)'
'Attrait' → 'Aspects attractifs'
'Service Prefere' → 'Service préféré'

'Prix Min Pack' → 'Prix min acceptable'
'Prix Max Pack' → 'Prix max acceptable'
'Prix Livraison' → 'Prix livraison max'
'Frequence Usage' → 'Fréquence utilisation'
'Panier Moyen' → 'Panier moyen estimé'

'Telephone' → 'Téléphone'
'Email' → 'Email'
'Prenom' → 'Prénom'
'Beta Tester' → 'Beta testeur'
```

## 3. ANALYTICS TAB ISSUES

### Formula Errors Found:
1. **Line 169**: References wrong column for Diaspora (`AI:AI` should be column for localisation='etranger')
2. **Line 173**: Quartier filter formula broken - should reference column N (index 14)
3. **Line 176-179**: Week number calculations reference wrong column `AV:AV` (doesn't exist)
4. **Line 170**: Conversion rate references wrong status column

### Corrected Formulas:
```javascript
// Total Responses
'=COUNTA(Responses!A:A)-1'

// Hot Leads
'=COUNTIF(Responses!C:C,">=70")'

// Diaspora Members - FIX
'=COUNTIF(Responses!M:M,"etranger")'  // Column M is Localisation

// Beta Testers - FIX
'=COUNTIF(Responses!AJ:AJ,TRUE)'  // Column AJ (36) is Beta Tester

// Weekly Trend - FIX (use timestamp column A)
'=COUNTIFS(Responses!A:A,">="&TODAY()-7,Responses!A:A,"<"&TODAY())'
```

## 4. HOT LEADS TAB ISSUES

### Problems:
1. Filter formula references wrong range `A:AW` (49 columns) but headers have more
2. Should filter by Lead Score >= 70 AND exclude header

### Corrected Formula:
```
=FILTER(Responses!A:BQ, Responses!C:C>=70, ROW(Responses!A:A)>1)
```

## 5. DIASPORA TAB ISSUES  

### Problems:
1. References column `AI:AI` for diaspora check - wrong column
2. Should check Localisation = "etranger"

### Corrected Formula:
```
=FILTER(Responses!A:BQ, Responses!M:M="etranger", ROW(Responses!A:A)>1)
```

## 6. LEAD SCORING CALCULATION ISSUES

### Problems in calculateLeadScore():
1. Uses `data.interet` but field might be `data.score_interet` or `data.interet_score`
2. Missing validation for undefined values
3. Diaspora bonus calculation references wrong fields

## 7. DATA ORDER MISMATCH

The rowData array (lines 427-517) doesn't match header order exactly:
- Missing fields between sections
- Diaspora fields mixed with local fields
- Week/Month calculations at wrong position

## RECOMMENDED FIXES

### Priority 1 - Critical:
1. Fix field mapping in google-sheets-script.gs lines 427-517
2. Fix Analytics formulas for correct column references
3. Fix Hot Leads and Diaspora filter formulas

### Priority 2 - Important:
1. Update all header labels to French user-friendly names
2. Fix lead scoring calculation
3. Add data validation

### Priority 3 - Nice to have:
1. Add charts/graphs to Analytics
2. Add automatic email notifications for hot leads
3. Add data export functionality