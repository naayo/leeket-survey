# Marché Digital Survey - Formulaire de Sondage

Formulaire de sondage pour une startup sénégalaise de livraison de courses à Dakar, avec intégration Airtable via Netlify Functions.

## 🎯 Objectif

Collecter des retours utilisateurs pour valider le product-market fit de notre solution et construire une base de 500 leads qualifiés pour le lancement du service, incluant la diaspora sénégalaise.

## 🚀 Installation

### Prérequis

- Node.js 18+ installé
- Compte Netlify (gratuit)
- Base Airtable configurée
- Clé API Airtable

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone [votre-repo]
cd marche-survey
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Airtable**

Créez une base Airtable avec une table "Responses" contenant ces champs :
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

4. **Configuration des variables d'environnement**

Créez un fichier `.env` à la racine :
```env
AIRTABLE_API_KEY=votre_cle_api_airtable
AIRTABLE_BASE_ID=votre_base_id
AIRTABLE_TABLE_NAME=Responses
```

## 🚢 Déploiement sur Netlify

### Option 1: Déploiement via CLI

1. **Installer Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Se connecter à Netlify**
```bash
netlify login
```

3. **Initialiser le site**
```bash
netlify init
```

4. **Configurer les variables d'environnement**
```bash
netlify env:set AIRTABLE_API_KEY "votre_cle_api"
netlify env:set AIRTABLE_BASE_ID "votre_base_id"
netlify env:set AIRTABLE_TABLE_NAME "Responses"
```

5. **Déployer**
```bash
netlify deploy --prod
```

### Option 2: Déploiement via GitHub

1. Pusher le code sur GitHub
2. Se connecter à [Netlify](https://app.netlify.com)
3. Cliquer sur "New site from Git"
4. Sélectionner votre repo GitHub
5. Configurer les variables d'environnement dans Settings > Environment variables
6. Déployer

## 🧪 Test en local

1. **Lancer le serveur de développement**
```bash
netlify dev
```

2. **Accéder au site**
```
http://localhost:8888
```

## 📊 Structure du projet

```
marche-survey/
├── index.html          # Formulaire principal (monochrome vert)
├── survey.js           # JavaScript avec auto-save et validation
├── success.html        # Page de confirmation
├── package.json        # Dépendances
├── netlify.toml        # Configuration Netlify
├── .env.example        # Template variables environnement
├── .gitignore          # Fichiers ignorés
├── CLAUDE.md           # Documentation pour Claude Code
├── README.md           # Ce fichier
└── netlify/
    └── functions/
        └── submit-survey.js  # Fonction serverless Airtable
```

## 🎨 Design

- **Couleur unique** : Vert #2ECC71 (AUCUN dégradé)
- **Mobile-first** : 80% des utilisateurs sur mobile
- **Sections** : 9 sections avec barre de progression (7 de base + 2 diaspora)
- **Auto-save** : Sauvegarde automatique du brouillon
- **Logique conditionnelle** : Questions diaspora s'affichent dynamiquement

## 📈 Lead Scoring

Le système calcule automatiquement un score de 0 à 100 :
- Score intérêt (1-5) × 10 points
- Budget élevé : +20 points
- Beta tester : +15 points
- Fréquence usage élevée : +15 points
- Membre diaspora : +10 points
- Intérêt diaspora élevé : +10 points
- Budget aide diaspora élevé : +10 points

Segments :
- **Hot Lead** : 70+ points
- **Warm Lead** : 40-69 points
- **Cold Lead** : <40 points

## 🔒 Sécurité

- Clés API côté serveur uniquement
- Validation côté client ET serveur
- Sanitisation des entrées
- CORS configuré
- Headers de sécurité

## 🐛 Troubleshooting

### Le formulaire ne s'envoie pas
- Vérifier les variables d'environnement dans Netlify
- Vérifier la configuration Airtable
- Consulter les logs : `netlify functions:log submit-survey`

### Erreur CORS
- Vérifier que le site est bien déployé sur Netlify
- En local, utiliser `netlify dev` au lieu d'ouvrir directement le HTML

### Données non sauvegardées dans Airtable
- Vérifier que tous les champs existent dans Airtable
- Vérifier les types de champs (Number, Text, etc.)
- Vérifier les permissions de la clé API

## 📱 Contact

- Email : contact@marcheapp.sn
- Instagram : @marcheapp_sn
- WhatsApp : +221 77 XXX XX XX

## 📄 Licence

MIT License - Marché Digital 2024