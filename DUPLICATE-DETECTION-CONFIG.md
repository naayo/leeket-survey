# Configuration de la Détection de Doublons

## Vue d'ensemble
Le système de détection de doublons empêche les utilisateurs de soumettre plusieurs fois le même formulaire avec le même numéro de téléphone ou email.

## Configuration dans `survey-config.js`

```javascript
duplicateDetection: {
    enabled: true,              // Activer/désactiver la détection
    checkPhone: true,           // Vérifier les numéros de téléphone
    checkEmail: true,           // Vérifier les emails
    message: 'Vous avez déjà participé au sondage', // Message personnalisé
    showExistingPromo: true,    // Afficher le code promo existant
}
```

## Options de Configuration

### `enabled` (boolean)
- **`true`** (défaut) : La détection de doublons est active
- **`false`** : Permet les soumissions multiples avec le même numéro/email

### `checkPhone` (boolean)
- **`true`** (défaut) : Vérifie les numéros de téléphone en doublons
- **`false`** : Ignore la vérification des numéros

### `checkEmail` (boolean)
- **`true`** (défaut) : Vérifie les emails en doublons
- **`false`** : Ignore la vérification des emails

### `message` (string)
- Message personnalisé affiché lors de la détection d'un doublon
- Défaut : `'Vous avez déjà participé au sondage'`

### `showExistingPromo` (boolean)
- **`true`** (défaut) : Affiche le code promo existant au participant
- **`false`** : Cache le code promo lors de tentative de doublon

## Exemples d'utilisation

### 1. Désactiver complètement la détection
```javascript
duplicateDetection: {
    enabled: false
}
```

### 2. Autoriser plusieurs soumissions par email mais pas par téléphone
```javascript
duplicateDetection: {
    enabled: true,
    checkPhone: true,
    checkEmail: false
}
```

### 3. Message personnalisé sans afficher le code promo
```javascript
duplicateDetection: {
    enabled: true,
    message: 'Une seule participation par personne est autorisée',
    showExistingPromo: false
}
```

## Comportement du Système

### Quand `enabled: true` (défaut)
1. Le système vérifie les doublons avant l'enregistrement
2. Compare les 9 derniers chiffres du numéro de téléphone
3. Compare les emails (insensible à la casse)
4. Si doublon détecté :
   - Affiche un message d'avertissement
   - Retourne le code promo existant (si configuré)
   - Bloque la nouvelle soumission

### Quand `enabled: false`
1. Aucune vérification de doublon
2. Toutes les soumissions sont acceptées
3. Chaque soumission génère un nouveau code promo
4. Utile pour les tests ou campagnes spéciales

## Considérations Techniques

### Formats de Numéros Supportés
Le système détecte les doublons même avec différents formats :
- Local : `771234567`
- International : `+221771234567`
- Avec zéros : `00221771234567`
- Avec espaces : `77 123 45 67`

### Performance
- La vérification ajoute ~100-200ms au temps de soumission
- Fonctionne efficacement jusqu'à 10,000 entrées
- Au-delà, considérer une indexation dans Google Sheets

## Déploiement

Après modification de la configuration :
1. Sauvegarder `survey-config.js`
2. Commit et push vers GitHub
3. Le déploiement Netlify se fait automatiquement
4. **Note** : Le Google Apps Script utilise sa propre logique et doit être mis à jour séparément si vous voulez désactiver la vérification côté serveur

## Debugging

Pour voir les logs de détection :
1. Ouvrir la console du navigateur (F12)
2. Soumettre un formulaire
3. Chercher les messages commençant par :
   - `🚫 Duplicate detected`
   - `ℹ️ Duplicate detected but detection is disabled`

## Support

Pour toute question ou problème :
- Vérifier les logs dans Google Apps Script
- Consulter la console du navigateur
- Vérifier que le script Google est bien déployé avec la dernière version