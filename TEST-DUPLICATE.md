# Test de détection des doublons

## Problème
Le même numéro de téléphone peut être utilisé plusieurs fois

## Vérifications à faire

### 1. Dans votre Google Apps Script

Vérifiez que la fonction `checkDuplicate` existe :

```javascript
function checkDuplicate(sheet, phone, email) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  
  // Find column indices
  const phoneCol = headers.indexOf('Telephone') >= 0 ? 
                   headers.indexOf('Telephone') : 
                   headers.indexOf('Téléphone');
  const emailCol = headers.indexOf('Email');
  const timestampCol = headers.indexOf('Timestamp') >= 0 ? 
                       headers.indexOf('Timestamp') : 
                       headers.indexOf('Date de soumission');
  const promoCol = headers.indexOf('Promo Code') >= 0 ? 
                   headers.indexOf('Promo Code') : 
                   headers.indexOf('Code Promo');
  
  // Check each row
  for (let i = 1; i < values.length; i++) {
    const rowPhone = values[i][phoneCol];
    const rowEmail = values[i][emailCol];
    
    // Clean phone numbers for comparison
    const cleanPhone = phone ? phone.toString().replace(/[\s\+\-\(\)]/g, '') : '';
    const cleanRowPhone = rowPhone ? rowPhone.toString().replace(/[\s\+\-\(\)]/g, '') : '';
    
    // Check if phone matches
    if (cleanPhone && cleanRowPhone && cleanPhone === cleanRowPhone) {
      console.log('DUPLICATE FOUND: Phone', cleanPhone, 'matches row', i+1);
      return {
        isDuplicate: true,
        existingRow: i + 1,
        existingPromo: values[i][promoCol],
        existingDate: values[i][timestampCol],
        matchType: 'phone'
      };
    }
    
    // Check if email matches
    if (email && rowEmail && 
        email.toString().toLowerCase() === rowEmail.toString().toLowerCase()) {
      return {
        isDuplicate: true,
        existingRow: i + 1,
        existingPromo: values[i][promoCol],
        existingDate: values[i][timestampCol],
        matchType: 'email'
      };
    }
  }
  
  return null;
}
```

### 2. Dans la fonction doPost

Assurez-vous que la vérification est appelée :

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // ... autres code ...
    
    // Check for duplicates
    const duplicate = checkDuplicate(sheet, data.telephone, data.email);
    
    if (duplicate) {
      console.log('DUPLICATE DETECTED:', duplicate);
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          isDuplicate: true,
          message: `Vous avez déjà participé`,
          promoCode: duplicate.existingPromo,
          matchType: duplicate.matchType
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ... continuer avec l'enregistrement ...
  }
}
```

### 3. Test manuel dans Google Apps Script

Ajoutez cette fonction de test :

```javascript
function testDuplicateDetection() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Responses');
  
  // Testez avec un numéro existant
  const testPhone = '771234567'; // Remplacez par un numéro dans votre sheet
  const result = checkDuplicate(sheet, testPhone, null);
  
  console.log('Test result:', result);
  
  if (result) {
    console.log('✅ Duplicate detection works!');
  } else {
    console.log('❌ No duplicate found for:', testPhone);
  }
}
```

## Problèmes possibles

### A. Formats de numéros différents
- `771234567` vs `+221771234567` vs `77 123 45 67`
- Solution : Nettoyer les numéros avant comparaison

### B. Noms de colonnes incorrects
- `Telephone` vs `Téléphone`
- `Timestamp` vs `Date de soumission`
- Solution : Vérifier les en-têtes exacts

### C. La fonction n'est pas déployée
- Solution : Redéployer le script après modifications

## Solution rapide

Remplacez votre fonction `checkDuplicate` par celle-ci qui gère mieux les formats :

```javascript
function checkDuplicate(sheet, phone, email) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  
  // Trouver les colonnes (flexible avec les noms)
  let phoneCol = -1;
  let emailCol = -1;
  let timestampCol = -1;
  let promoCol = -1;
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toString().toLowerCase();
    if (header.includes('phone') || header.includes('téléphone')) phoneCol = i;
    if (header.includes('email')) emailCol = i;
    if (header.includes('timestamp') || header.includes('date')) timestampCol = i;
    if (header.includes('promo') || header.includes('code')) promoCol = i;
  }
  
  // Nettoyer le numéro entrant (garder que les chiffres)
  const cleanPhone = phone ? phone.toString().replace(/\D/g, '') : '';
  
  // Vérifier chaque ligne
  for (let i = 1; i < values.length; i++) {
    const rowPhone = values[i][phoneCol];
    if (!rowPhone) continue;
    
    // Nettoyer le numéro de la ligne
    const cleanRowPhone = rowPhone.toString().replace(/\D/g, '');
    
    // Comparer les derniers 9 chiffres (numéro sénégalais sans code pays)
    const phoneEnd = cleanPhone.slice(-9);
    const rowPhoneEnd = cleanRowPhone.slice(-9);
    
    if (phoneEnd && rowPhoneEnd && phoneEnd === rowPhoneEnd) {
      return {
        isDuplicate: true,
        existingRow: i + 1,
        existingPromo: values[i][promoCol] || 'N/A',
        existingDate: values[i][timestampCol] || new Date(),
        matchType: 'phone'
      };
    }
  }
  
  return null;
}
```