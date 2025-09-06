# Prompt Claude Code - Projet Leeket Survey

## 📋 Développement Complet - Formulaire Sondage Leeket avec Intégration Airtable

### 🎯 Contexte
Je développe un formulaire de sondage pour Leeket, une startup sénégalaise de courses en ligne. Le formulaire est déjà créé en HTML mais j'ai besoin de le transformer en projet complet déployable sur Netlify avec sauvegarde sécurisée dans Airtable.

### 🎯 Objectif
Créer une application web complète avec :
1. Formulaire HTML responsive (déjà existant, à optimiser)
2. Fonction serverless Netlify pour sécuriser l'API Airtable
3. Page de confirmation après soumission
4. Configuration complète pour déploiement Netlify
5. Gestion d'erreurs robuste
6. Design monochrome vert (#2ECC71) sans dégradés

### 📁 Structure des Fichiers à Créer

```
leeket-survey/
├── index.html          # Formulaire principal (à modifier)
├── success.html        # Page de confirmation  
├── package.json        # Dépendances NPM
├── netlify.toml        # Configuration Netlify
├── .env.example        # Template variables environnement
├── README.md           # Documentation
└── netlify/
    └── functions/
        └── submit-survey.js  # Fonction serverless Airtable
```

## 📝 Spécifications Détaillées

### 1. FORMULAIRE (index.html)

Le formulaire existant doit être modifié pour :

- **Supprimer TOUS les dégradés** (remplacer par couleur unie #2ECC71)
- **Ajouter validation côté client** robuste
- **Implémenter envoi AJAX** vers fonction Netlify
- **Ajouter indicateurs de chargement** pendant l'envoi
- **Gérer les erreurs** avec messages user-friendly
- **Assurer responsive design** mobile-first
- **Forcer le vert monochrome** partout avec !important

#### Structure du formulaire en 7 sections :

1. **Profil** (quartier, âge, foyer, profession)
2. **Habitudes courses** (lieux, fréquence, budget, défis)
3. **Préférences culinaires** (plats sénégalais, fréquence cuisine)
4. **Système commande anticipée** (délai 24/48h, commandes programmées)
5. **Concept Leeket** (intérêt, attraits, service préféré)
6. **Prix et utilisation** (prix pack, livraison, fréquence, panier)
7. **Contact** (téléphone requis, email optionnel, beta tester)

### 2. FONCTION SERVERLESS (netlify/functions/submit-survey.js)

Créer une fonction qui :
- Valide les données reçues
- Formate pour Airtable (gestion arrays, conversions types)
- Calcule un Lead Score (0-100) basé sur :
  * Score intérêt (1-5) × 10 points
  * Budget élevé = +20 points
  * Beta tester = +15 points
  * Fréquence usage haute = +15 points
- Détermine le segment (Hot/Warm/Cold Lead)
- Envoie à Airtable via API
- Retourne confirmation ou erreur détaillée

#### Champs Airtable à mapper :

```javascript
{
  "Timestamp": ISO date,
  "Quartier": string,
  "Age": string,
  "Taille Foyer": string,
  "Profession": string,
  "Lieux Courses": array → string,
  "Frequence Courses": string,
  "Budget Hebdo": string,
  "Defis": array → string,
  "Plats Préférés": array → string,
  "Delai Commande": string,
  "Commande Auto": string,
  "Score Interet": number,
  "Service Prefere": string,
  "Prix Min Pack": number,
  "Prix Max Pack": number,
  "Telephone": string (required),
  "Email": string,
  "Beta Tester": boolean,
  "Lead Score": calculated number,
  "Segment": calculated string,
  "Status": "Nouveau"
}
```

### 3. PAGE SUCCESS (success.html)

Page de confirmation avec :
- Message de remerciement en français/wolof
- Code promo affiché : **LEEKET2000**
- Instructions prochaines étapes
- Liens réseaux sociaux
- Design cohérent (vert #2ECC71)
- Animation check vert au chargement

### 4. CONFIGURATION (netlify.toml)

```toml
[build]
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 5. PACKAGE.JSON

Dépendances minimales :
- node-fetch (pour API calls)
- Pas de build process nécessaire

### 6. VARIABLES ENVIRONNEMENT (.env.example)

```env
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
# Optionnel pour SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### 7. README.MD

Documentation complète :
- Instructions déploiement
- Configuration Airtable
- Variables environnement
- Structure données
- Guide test local
- Troubleshooting

## 🔧 Contraintes Techniques

### 1. **Sécurité**
- API keys uniquement côté serveur
- Validation données côté client ET serveur
- Sanitization inputs
- Rate limiting suggestions

### 2. **Performance**
- Minifier HTML/CSS/JS inline
- Lazy loading pour sections
- Optimisation images (emojis uniquement)
- Cache headers appropriés

### 3. **Accessibilité**
- Labels corrects sur tous les inputs
- Navigation clavier complète
- Messages d'erreur explicites
- Contraste WCAG AA minimum

### 4. **Design**
- **AUCUN dégradé** (bannir linear-gradient)
- Couleur principale : **#2ECC71**
- Couleur secondaire : **#27AE60** (vert foncé)
- Background : **#f8fafb**
- Forcer avec !important si nécessaire

### 5. **Compatibilité**
- Mobile-first responsive
- Support navigateurs modernes
- Fallback pour JavaScript désactivé
- Messages offline-friendly

## 💻 Code Spécifique à Implémenter

### Validation côté client améliorée :

```javascript
// Validation téléphone Sénégal
const phoneRegex = /^(77|78|76|70|75)[0-9]{7}$/;

// Empêcher soumissions multiples
let isSubmitting = false;

// Retry logic pour erreurs réseau
const MAX_RETRIES = 3;
```

### Gestion erreurs utilisateur :

```javascript
const errorMessages = {
  'network': 'Problème de connexion. Vérifiez votre internet.',
  'validation': 'Certains champs sont incorrects.',
  'server': 'Erreur serveur. Réessayez dans quelques instants.',
  'duplicate': 'Vous avez déjà participé au sondage.'
};
```

### Tracking Analytics (optionnel) :

```javascript
// Google Analytics 4
gtag('event', 'form_progress', {
  'section': currentSection,
  'percentage': progressPercentage
});
```

## 🎨 Exemples de Code à Intégrer

### Force suppression gradients CSS :

```css
/* CRITICAL: NO GRADIENTS */
* {
  background-image: none !important;
}

.header {
  background: #2ECC71 !important;
  background-color: #2ECC71 !important;
  background-image: none !important;
}

.progress-fill {
  background: #2ECC71 !important;
  background-color: #2ECC71 !important;
  background-image: none !important;
}

.btn-next,
.btn-submit {
  background: #2ECC71 !important;
  background-color: #2ECC71 !important;
  background-image: none !important;
}

.section-number {
  background: #2ECC71 !important;
  background-color: #2ECC71 !important;
  background-image: none !important;
}
```

### LocalStorage pour sauvegarde brouillon :

```javascript
// Sauvegarder progression toutes les 30 secondes
setInterval(saveProgress, 30000);

function saveProgress() {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  data.currentSection = currentSection;
  localStorage.setItem('leeket_survey_draft', JSON.stringify(data));
}

// Restaurer au chargement
function restoreProgress() {
  const saved = localStorage.getItem('leeket_survey_draft');
  if (saved) {
    const data = JSON.parse(saved);
    if (confirm('Voulez-vous reprendre votre sondage là où vous vous êtes arrêté?')) {
      // Restaurer les valeurs
      Object.keys(data).forEach(key => {
        const input = form.elements[key];
        if (input) {
          if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = data[key] === input.value;
          } else {
            input.value = data[key];
          }
        }
      });
      // Aller à la section sauvegardée
      currentSection = data.currentSection || 1;
      showSection(currentSection);
    }
  }
}
```

### Gestion offline :

```javascript
// Détecter status connexion
window.addEventListener('online', () => {
  showNotification('Connexion rétablie', 'success');
});

window.addEventListener('offline', () => {
  showNotification('Pas de connexion. Vos réponses seront sauvegardées localement.', 'warning');
});

// Queue pour envois offline
const offlineQueue = [];

function submitFormData(data) {
  if (navigator.onLine) {
    return sendToNetlify(data);
  } else {
    offlineQueue.push(data);
    localStorage.setItem('leeket_offline_queue', JSON.stringify(offlineQueue));
    return Promise.resolve({ offline: true });
  }
}
```

## 📦 Livrables Attendus

1. **Projet complet** prêt au déploiement
2. **Zéro dégradé** dans le CSS (vert uni uniquement)
3. **Fonction serverless** sécurisée et robuste
4. **Documentation** claire pour déploiement
5. **Gestion erreurs** complète
6. **Validation** côté client et serveur
7. **Mobile-first** responsive design
8. **Code commenté** en français
9. **Sauvegarde automatique** des réponses
10. **Support offline** basique

## 🚀 Instructions Finales

Génère le projet complet avec tous les fichiers. Le formulaire HTML existant doit être optimisé mais garder sa structure de base. Focus sur :

1. **Suppression totale des dégradés** - Remplacer TOUS les linear-gradient par #2ECC71
2. **Intégration Airtable sécurisée** - API key côté serveur uniquement
3. **Expérience utilisateur fluide** - Loading states, messages d'erreur clairs
4. **Code production-ready** - Gestion erreurs, retry logic, validation

Le projet doit être déployable immédiatement sur Netlify après configuration des variables d'environnement.

## 💼 Contexte Business

**Leeket** est une startup de livraison de courses au Sénégal avec un modèle de commande anticipée (24-48h). 

### Objectifs du formulaire :
- Valider le product-market fit
- Identifier les early adopters (beta testers)
- Comprendre les habitudes alimentaires locales
- Tester l'acceptation du modèle anticipé
- Constituer une base de 500 contacts qualifiés

**Cible** : Dakar, classes moyennes et supérieures, 25-45 ans.

### Métriques de succès :
- Taux de complétion > 70%
- Score intérêt moyen > 3.5/5
- % beta testers > 30%
- Temps de complétion < 5 minutes

## 🛠️ Instructions d'Exécution

```bash
# Génère le projet complet dans le dossier "leeket-survey" 
# avec tous les fichiers spécifiés

# Structure exacte à créer :
mkdir leeket-survey
cd leeket-survey
mkdir -p netlify/functions

# Fichiers à générer :
# - index.html (formulaire optimisé, sans gradients)
# - success.html (page de confirmation)
# - netlify/functions/submit-survey.js (fonction Airtable)
# - package.json (dépendances)
# - netlify.toml (configuration)
# - .env.example (template variables)
# - README.md (documentation complète)

# Assure-toi que :
# - TOUS les dégradés sont supprimés et remplacés par du vert uni #2ECC71
# - Le code est production-ready et commenté en français
# - La structure de dossiers est exactement comme spécifiée
# - Tous les fichiers sont créés et fonctionnels
# - Le JavaScript utilise async/await moderne
# - Les erreurs sont gérées proprement
```

## ✅ Checklist de Validation

### Design & CSS
- [ ] Aucun `linear-gradient` dans le CSS
- [ ] Aucun `background-image` avec gradient
- [ ] Couleur #2ECC71 appliquée partout
- [ ] Force avec `!important` sur les backgrounds
- [ ] Header vert uni
- [ ] Progress bar verte unie
- [ ] Boutons verts unis
- [ ] Mobile responsive parfait

### Fonctionnalités
- [ ] Fonction serverless complète et sécurisée
- [ ] Validation téléphone Sénégal fonctionnelle
- [ ] Lead Score calculé automatiquement (0-100)
- [ ] Segment déterminé (Hot/Warm/Cold)
- [ ] Messages d'erreur en français
- [ ] LocalStorage pour sauvegarde brouillon
- [ ] Restauration progression au reload
- [ ] Gestion offline basique

### Sécurité & Performance
- [ ] API keys uniquement côté serveur
- [ ] Validation côté client ET serveur
- [ ] Protection contre soumissions multiples
- [ ] Retry logic pour erreurs réseau
- [ ] Loading states pendant envoi
- [ ] Minification code inline

### Documentation
- [ ] README avec instructions claires
- [ ] Variables environnement documentées
- [ ] Structure Airtable expliquée
- [ ] Guide déploiement Netlify
- [ ] Troubleshooting common issues

### Tests
- [ ] Test validation tous les champs
- [ ] Test envoi vers Airtable
- [ ] Test page success
- [ ] Test responsive mobile
- [ ] Test offline/online
- [ ] Test restauration draft

## 📚 Ressources & Références

### APIs utilisées
- [Airtable API](https://airtable.com/developers/web/api/introduction)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Twilio SMS API](https://www.twilio.com/docs/sms) (optionnel)

### Design System
- Couleur principale : `#2ECC71` (Vert Leeket)
- Couleur secondaire : `#27AE60` (Vert foncé)
- Background : `#f8fafb` (Gris très clair)
- Police : Inter, system fonts fallback
- Border radius : 12px (inputs), 20px (container)
- Spacing : 8px grid system

### Validation Patterns
- Téléphone SN : `/^(77|78|76|70|75)[0-9]{7}$/`
- Email : HTML5 email validation
- Required fields : HTML5 required + JS validation

---

## 🚨 IMPORTANT - Points Critiques

### 1. AUCUN DÉGRADÉ
Le client insiste sur un design **monochrome vert**. Vérifier chaque élément :
- Header : background #2ECC71 !important
- Progress bar : background #2ECC71 !important  
- Buttons : background #2ECC71 !important
- Section numbers : background #2ECC71 !important

### 2. SÉCURITÉ API
- Ne JAMAIS exposer l'API key Airtable côté client
- Toujours passer par la fonction serverless
- Valider et sanitizer toutes les entrées

### 3. EXPÉRIENCE MOBILE
- 80% des utilisateurs seront sur mobile
- Tester sur petits écrans (320px width)
- Boutons minimum 44x44px pour touch
- Font size minimum 16px pour éviter zoom iOS

### 4. CONTEXTE SÉNÉGALAIS
- Interface en français
- Support numéros téléphone locaux
- Montants en FCFA
- Références culturelles (plats locaux, quartiers Dakar)

---

**Génère maintenant le projet complet avec tous les fichiers nécessaires, en respectant scrupuleusement ces spécifications.**