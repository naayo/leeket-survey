# Débogage du compteur de participants

## Problème actuel
- Affiche "250" au démarrage (valeur HTML par défaut)
- Puis affiche "5061" (valeur simulée au lieu des vraies données)
- Devrait afficher "4" (vos vraies données Google Sheets)

## Pour déboguer

### 1. Ouvrez la console du navigateur (F12)

### 2. Exécutez ces commandes pour vider le cache :
```javascript
// Vider le cache
localStorage.removeItem('leeket_participant_count');
localStorage.removeItem('leeket_count_time');

// Forcer le rafraîchissement
location.reload();
```

### 3. Regardez les messages dans la console :
Vous devriez voir :
- `"Fetching real participant count from Google Sheets..."`
- `"API Response status: 200"`
- `"API Response data: {..."` 
- Soit `"✅ Real participant count from Google Sheets: 4"`
- Soit `"❌ Could not fetch..."` si erreur

## Problèmes possibles

### A. CORS Error
Si vous voyez "CORS error" ou "blocked by CORS policy" :
- Votre Google Apps Script n'autorise pas les requêtes cross-origin
- Solution : Dans votre Google Apps Script, ajoutez les headers CORS

### B. API retourne un format incorrect
Si vous voyez `"⚠️ API returned unexpected format"` :
- L'API ne retourne pas le bon format JSON
- Vérifiez ce que retourne votre endpoint `?action=getStats`

### C. Fallback activé par erreur
Si vous voyez `"Using simulated count: 5061"` :
- L'API échoue ou ne retourne pas `success: true`
- Le code passe au fallback simulé

## Solution rapide

Pour forcer l'affichage de 4 immédiatement (temporaire) :

1. Dans survey.js, ligne 1036, changez :
```javascript
const forceRefresh = false; // Changez en true
```

2. Ligne 1086, changez temporairement :
```javascript
const displayCount = 4; // Forcez à 4 pour test
```

## Solution permanente

Votre Google Apps Script doit retourner EXACTEMENT ce format :
```javascript
function doGet(e) {
  if (e.parameter.action === 'getStats') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Responses');
    const totalResponses = Math.max(0, sheet.getLastRow() - 1); // -1 pour exclure l'en-tête
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        totalResponses: totalResponses,
        lastUpdate: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*'
      });
  }
}
```