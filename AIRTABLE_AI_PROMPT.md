# Airtable AI Prompt - Complete Database Setup for Leeket Survey

Copy and paste this entire prompt into Airtable AI to create your complete database structure:

---

## PROMPT FOR AIRTABLE AI:

Create a complete database for the Leeket Survey application, a Senegalese grocery delivery service collecting market validation data from both local users and diaspora. 

### Create a base called "Leeket Survey Database" with the following tables:

## Table 1: "Responses" (Main survey responses table)

Create these fields with exact names and types:

**Identification & Timestamps:**
- `Timestamp` - Date time field with time zone
- `Status` - Single select (Options: Nouveau, Contacté, En cours, Converti, Abandonné)
- `Lead Score` - Number (integer 0-100)
- `Segment` - Single select (Options: Hot Lead, Warm Lead, Cold Lead)

**Demographics (Section 1):**
- `Quartier` - Single select (Options: Plateau, Almadies, Mermoz, Sacré-Cœur, Point E, Fann, Parcelles Assainies, Grand Dakar, Liberté, HLM, Médina, Ouakam, Yoff, Ngor, Autre)
- `Age` - Single select (Options: 18-25, 26-35, 36-45, 46-55, 56+)
- `Taille Foyer` - Single select (Options: 1, 2, 3-4, 5-6, 7+)
- `Profession` - Single select (Options: salarie, entrepreneur, etudiant, menagere, retraite)

**Shopping Habits (Section 2):**
- `Lieux Courses` - Multiple select (Options: marche_traditionnel, supermarche, boutique_quartier, vendeur_ambulant, online)
- `Frequence Courses` - Single select (Options: quotidien, 2-3fois, hebdo, bimensuel, mensuel)
- `Budget Hebdo` - Single select (Options: <10000, 10000-20000, 20000-35000, 35000-50000, 50000-75000, 75000+)
- `Defis` - Multiple select (Options: temps, transport, qualite, prix, disponibilite, foule)

**Culinary Preferences (Section 3):**
- `Plats Préférés` - Multiple select (Options: thieboudienne, yassa, mafe, thiou, domoda, supkanja, caldou, bassi, ceebujenblanc, firire, pastels, fataya)
- `Frequence Cuisine` - Single select (Options: quotidien, 4-5fois, 2-3fois, weekend, occasionnel)
- `Qui Cuisine` - Single select (Options: moi, conjoint, aide, partage, restaurant)

**Order System (Section 4):**
- `Delai Commande` - Single select (Options: 24h, 48h, 72h, flexible)
- `Commande Auto` - Single select (Options: oui_hebdo, oui_bi_hebdo, oui_mensuel, oui_personnalise, non)
- `Avantages Anticipe` - Multiple select (Options: reduction, livraison_gratuite, priorite, creneau, personnalisation, points)
- `Delai Ideal` - Single select (Options: 2h, meme_jour, 24h, 48h, peu_importe)

**Leeket Concept (Section 5):**
- `Score Interet` - Rating (1-5 scale)
- `Attrait` - Multiple select (Options: gain_temps, packs_recettes, qualite, prix_transparents, hub_proximite, commande_avance)
- `Service Prefere` - Single select (Options: livraison, click_collect, mixte, hub_direct)

**Pricing (Section 6):**
- `Prix Min Pack` - Currency (FCFA)
- `Prix Max Pack` - Currency (FCFA)
- `Prix Livraison` - Single select (Options: 0, 500, 1000, 1500, variable)
- `Frequence Usage` - Single select (Options: quotidien, 3-4fois, 1-2fois, bimensuel, occasionnel)
- `Panier Moyen` - Single select (Options: <3000, 3000-5000, 5000-7500, 7500-10000, 10000-15000, 15000+)

**Contact & Feedback (Section 7):**
- `Suggestions` - Long text
- `Inquietudes` - Multiple select (Options: fraicheur, delai_24h, prix, choix, livraison, paiement, aucune)
- `Telephone` - Phone (Senegalese format)
- `Email` - Email
- `Prenom` - Single line text
- `Beta Tester` - Checkbox

**Diaspora Fields (Sections 8-9):**
- `Est Diaspora` - Single select (Options: oui, non)
- `Pays Residence` - Single select (Options: france, usa, canada, italie, espagne, belgique, allemagne, uk, suisse, pays-bas, maroc, cote-ivoire, gabon, mauritanie, dubai, autre)
- `Freq Aide Alimentaire` - Single select (Options: mensuel, trimestriel, occasionnel, jamais)
- `Methode Aide Actuelle` - Multiple select (Options: argent, visite, quelqu'un, colis, aucune)
- `Budget Aide Mensuel` - Single select (Options: <50, 50-100, 100-200, 200-300, 300-500, 500+)
- `Interet Diaspora` - Rating (1-5 scale)
- `Fonctionnalites Diaspora` - Multiple select (Options: paiement_securise, suivi_temps_reel, photo_confirmation, abonnement, packs_fetes, choix_beneficiaire, multi_beneficiaires, historique)
- `Frais Service Diaspora` - Single select (Options: 0, 5, 10, 15, fixe)
- `Freq Utilisation Diaspora` - Single select (Options: hebdo, bimensuel, mensuel, fetes, occasionnel)
- `Beneficiaire Quartier` - Single line text
- `Nombre Beneficiaires` - Number (integer)

**Add these calculated/formula fields:**
- `Days Since Submission` - Formula: `DATETIME_DIFF(NOW(), {Timestamp}, 'days')`
- `Lead Quality Score` - Formula: `IF({Lead Score} >= 70, "🔥 Hot", IF({Lead Score} >= 40, "🌡️ Warm", "❄️ Cold"))`
- `Total Potential Value` - Formula: `IF({Frequence Usage} = "quotidien", {Prix Max Pack} * 30, IF({Frequence Usage} = "3-4fois", {Prix Max Pack} * 15, IF({Frequence Usage} = "1-2fois", {Prix Max Pack} * 6, {Prix Max Pack} * 2)))`

## Table 2: "Analytics Dashboard" (Linked summary table)

Create fields:
- `Metric Name` - Single line text
- `Value` - Number
- `Last Updated` - Date time
- `Category` - Single select (Options: Demographics, Engagement, Revenue, Diaspora)

Add these records:
1. Total Responses
2. Hot Leads Count
3. Average Lead Score
4. Diaspora Percentage
5. Beta Testers Count
6. Average Budget
7. Most Popular District
8. Preferred Service Type

## Table 3: "Follow-ups" (CRM tracking)

Create fields:
- `Response` - Link to Responses table
- `Contact Date` - Date
- `Contact Method` - Single select (Options: SMS, Email, WhatsApp, Phone)
- `Notes` - Long text
- `Next Action` - Single select (Options: Send promo code, Schedule demo, Add to beta, No action needed)
- `Assigned To` - Collaborator

## Table 4: "Promo Codes" 

Create fields:
- `Code` - Single line text (Primary field)
- `Response` - Link to Responses table
- `Amount` - Currency (2000 FCFA default)
- `Status` - Single select (Options: Generated, Sent, Used, Expired)
- `Generated Date` - Date time
- `Expiry Date` - Formula: `DATEADD({Generated Date}, 90, 'days')`

## Views to create:

### In "Responses" table:
1. **"Hot Leads"** - Filter: Lead Score >= 70, Sort by Lead Score desc
2. **"Diaspora Members"** - Filter: Est Diaspora = "oui", Group by Pays Residence
3. **"Beta Testers"** - Filter: Beta Tester = checked
4. **"Need Follow-up"** - Filter: Status = "Nouveau", Sort by Timestamp
5. **"High Value"** - Filter: Budget Hebdo contains "50000" OR "75000+"
6. **"Weekly Report"** - Filter: Created this week, Group by Segment

### In "Follow-ups" table:
1. **"Today's Tasks"** - Filter: Next Action is not empty, Sort by Contact Date
2. **"SMS Queue"** - Filter: Contact Method = "SMS", Status = "Pending"

## Automations to create:

1. **"Welcome Email"** - When record created in Responses AND Email is not empty → Send email
2. **"Lead Score Alert"** - When Lead Score >= 70 → Send Slack notification
3. **"Generate Promo Code"** - When record created in Responses → Create record in Promo Codes
4. **"Weekly Report"** - Every Monday at 9am → Email summary of new responses

## Forms to create:

Create a form view called "Survey Form" with:
- All required fields from Sections 1-7
- Conditional logic: Show diaspora fields only if "Est Diaspora" = "oui"
- Custom submit message: "Jërëjëf! Votre code promo arrive par SMS dans 24h."

## Interfaces to create:

1. **"Lead Dashboard"** with:
   - Number metrics for Total Leads, Hot Leads, Conversion Rate
   - Chart of Leads by Segment
   - Recent submissions list
   - Map visualization by Quartier

2. **"Diaspora Analytics"** with:
   - Diaspora percentage metric
   - Countries breakdown chart
   - Average diaspora budget
   - Top requested features

---

Please create this complete database structure with all tables, fields, views, and automations as specified. Use French labels where indicated but keep field names in the exact format provided for API compatibility.