# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Market Survey - A market validation survey form for a Senegalese grocery delivery startup targeting Dakar residents. The project collects user feedback about interest in a 24-48h advance ordering system for fresh groceries with recipe-based ingredient packs. (Project name hidden for security reasons)

## Current Status

- ✅ Comprehensive specification in `specs/claude-code-prompt-leeket.md`
- ✅ HTML prototype in `specs/leeket-survey-form.html`
- ❌ **CRITICAL**: Current HTML uses gradients (violates strict no-gradient requirement)
- ❌ No backend implementation (Netlify Functions needed)
- ❌ No Airtable integration
- ❌ No deployment configuration

## Critical Design Rule

**ABSOLUTELY NO GRADIENTS** - The specification explicitly forbids gradients. Use solid green (#2ECC71) only. Force with `!important` if needed. The current HTML prototype violates this rule and must be fixed.

## Architecture

### Planned Structure
```
leeket-survey/
├── index.html          # Main survey form (needs gradient removal)
├── success.html        # Confirmation page with promo code
├── package.json        # Dependencies (node-fetch for Airtable)
├── netlify.toml        # Netlify deployment config
├── .env.example        # Environment variables template
└── netlify/
    └── functions/
        └── submit-survey.js  # Serverless function for Airtable
```

### Technology Stack
- **Frontend**: Pure HTML/CSS/JavaScript (no frameworks, no build process)
- **Backend**: Netlify Functions (serverless)
- **Database**: Airtable
- **Deployment**: Netlify
- **Language**: French (targeting Senegalese market)

## Development Commands

Since no package.json exists yet, these commands will be available after setup:

```bash
# Install dependencies (after package.json is created)
npm install

# Run locally with Netlify CLI
netlify dev

# Deploy to Netlify
netlify deploy --prod
```

## High-Level Requirements

### Survey Structure (7 sections)
1. **Profil** - Demographics (neighborhood, age, household, profession)
2. **Habitudes courses** - Shopping habits (locations, frequency, budget, challenges)
3. **Préférences culinaires** - Culinary preferences (Senegalese dishes, cooking frequency)
4. **Système commande** - Order system (24/48h delay, scheduled orders)
5. **Concept** - Concept validation (interest score 1-5, preferred services)
6. **Prix** - Pricing (pack prices 2500-10000 FCFA, delivery preferences)
7. **Contact** - Contact info (phone required, email optional, beta tester opt-in)

### Lead Scoring Algorithm
Calculate 0-100 score based on:
- Interest score (1-5) × 10 points
- High budget = +20 points
- Beta tester = +15 points
- High frequency = +15 points
- Segment: Hot (70+), Warm (40-69), Cold (<40)

### Key Business Context
- **Model**: 24-48h advance ordering for freshness
- **Products**: Recipe-based ingredient packs for traditional Senegalese dishes
- **Delivery**: Hub-based pickup or home delivery
- **Target**: Middle/upper class Dakar residents, ages 25-45
- **Goal**: Validate PMF and collect 500 qualified leads

## Implementation Priority

1. **Fix design violation**: Remove ALL gradients from `specs/leeket-survey-form.html`
2. **Create backend**: Implement `netlify/functions/submit-survey.js` with Airtable integration
3. **Add scoring**: Implement lead scoring algorithm in serverless function
4. **Setup deployment**: Create `package.json`, `netlify.toml`, `.env.example`
5. **Add features**: Offline support, auto-save, progressive enhancement

## Important Constraints

- **Mobile-first**: 80% of users expected on mobile
- **Performance**: Inline CSS/JS, no external dependencies
- **Accessibility**: WCAG AA compliance required
- **Security**: API keys server-side only, input sanitization required
- **Cultural**: Senegalese phone validation, FCFA currency, local neighborhoods/dishes

## Airtable Schema

All fields map to Airtable with these exact names:
- Timestamp, Quartier, Age, Taille Foyer, Profession
- Lieux Courses (array→string), Frequence Courses, Budget Hebdo, Defis (array→string)
- Plats Préférés (array→string), Delai Commande, Commande Auto
- Score Interet, Service Prefere, Prix Min Pack, Prix Max Pack
- Telephone (required), Email, Beta Tester
- Lead Score (calculated), Segment (calculated), Status ("Nouveau")

## Environment Variables

Required in `.env` for production:
```
AIRTABLE_API_KEY=your_key_here
AIRTABLE_BASE_ID=your_base_id_here
AIRTABLE_TABLE_NAME=Responses
```