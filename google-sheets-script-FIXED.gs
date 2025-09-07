/**
 * Google Apps Script for Leeket Survey - FIXED VERSION
 * Corrects field mappings, formulas, and header labels
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Save and click "Deploy" > "New Deployment"
 * 5. Choose "Web app" as type
 * 6. Set "Execute as" to "Me"
 * 7. Set "Who has access" to "Anyone"
 * 8. Copy the Web App URL for your form
 */

// Configuration
const CONFIG = {
  RESPONSES_SHEET: 'Responses',
  ANALYTICS_SHEET: 'Analytics',
  HOT_LEADS_SHEET: 'Hot Leads',
  DIASPORA_SHEET: 'Diaspora'
};

/**
 * Initialize the spreadsheet with all required sheets and headers
 */
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Create Responses sheet with headers
  let responsesSheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET);
  if (!responsesSheet) {
    responsesSheet = ss.insertSheet(CONFIG.RESPONSES_SHEET);
  }
  
  // User-friendly French headers
  const headers = [
    // Metadata
    'Date de soumission',
    'ID Unique',
    'Score Lead (0-100)',
    'Segment Client',
    'Statut',
    
    // PROMO CODE FIELDS
    'Code Promo',
    'Statut Code',
    'Valeur (FCFA)',
    'Date Expiration',
    'Code Utilisé',
    'Date Utilisation',
    
    // Section 1: Profil
    'Type Utilisateur', // senegal/etranger
    'Quartier/Zone',
    'Pays (Diaspora)',
    'Tranche d\'âge',
    'Taille du foyer',
    'Situation professionnelle',
    
    // Section 2: Habitudes (skipped for diaspora)
    'Lieux d\'achat habituels',
    'Fréquence courses',
    'Budget hebdomadaire',
    'Défis rencontrés',
    
    // Section 3: Cuisine (skipped for diaspora)
    'Plats sénégalais préférés',
    'Fréquence cuisine maison',
    'Qui cuisine',
    
    // Section 4: Commande (skipped for diaspora)
    'Délai commande préféré',
    'Intérêt commande auto',
    'Avantages anticipés',
    'Délai idéal',
    
    // Section 5: Concept (skipped for diaspora)
    'Intérêt (1-5)',
    'Aspects attractifs',
    'Service préféré',
    
    // Section 6: Prix (skipped for diaspora)
    'Prix min acceptable',
    'Prix max acceptable',
    'Prix livraison max',
    'Fréquence utilisation prévue',
    'Panier moyen estimé',
    
    // Section 7: Experience (skipped for diaspora)
    'Suggestions générales',
    'Inquiétudes',
    
    // Section 8: Diaspora specific
    'Zones famille Sénégal', // zones_famille
    'Fonctionnalités essentielles', // fonctionnalites_essentielles
    'Types produits souhaités', // types_produits
    'Préférence organisation commande', // preference_commande
    'Frais service acceptable', // frais_service_diaspora
    'Fréquence utilisation diaspora', // freq_utilisation_diaspora
    'Nombre de foyers à aider', // nombre_beneficiaires
    
    // Section 9: Contact (for all users)
    'Téléphone',
    'Email',
    'Prénom',
    'Beta testeur',
    
    // Section 10: Final suggestions
    'Services manquants (Diaspora)', // services_manquants
    'Difficultés rencontrées (Diaspora)', // difficultes_diaspora
    'Fonctionnalités innovantes (Diaspora)', // fonctionnalites_innovantes
    'Recommandation (Diaspora)', // recommandation_diaspora
    'Suggestions amélioration (Local)', // suggestions_amelioration
    'Services souhaités (Local)', // services_souhaites
    'Recommandation (Local)', // recommandation_locale
    
    // Calculated fields
    'Semaine',
    'Mois'
  ];
  
  responsesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  responsesSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  responsesSheet.setFrozenRows(1);
  
  // Format the header
  responsesSheet.getRange(1, 1, 1, headers.length)
    .setBackground('#2ECC71')
    .setFontColor('#FFFFFF');
  
  // Create other sheets
  createAnalyticsSheet(ss);
  createHotLeadsSheet(ss);
  createDiasporaSheet(ss);
  
  return responsesSheet;
}

/**
 * Create analytics dashboard sheet with FIXED formulas
 */
function createAnalyticsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.ANALYTICS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.ANALYTICS_SHEET);
  }
  
  const dashboard = [
    ['Tableau de Bord - Leeket Survey', '', '', ''],
    ['', '', '', ''],
    ['Métrique', 'Valeur', 'Objectif', '% Atteint'],
    ['Total Réponses', '=COUNTA(Responses!A:A)-1', '500', '=B4/C4'],
    ['Hot Leads (70+)', '=COUNTIF(Responses!C:C,">=70")', '150', '=B5/C5'],
    ['Warm Leads (40-69)', '=COUNTIFS(Responses!C:C,">=40",Responses!C:C,"<70")', '200', '=B6/C6'],
    ['Cold Leads (<40)', '=COUNTIF(Responses!C:C,"<40")', '-', ''],
    ['Score Lead Moyen', '=IFERROR(AVERAGE(Responses!C:C),0)', '60', '=B8/C8'],
    ['Beta Testeurs', '=COUNTIF(Responses!AV:AV,TRUE)', '100', '=B9/C9'],
    ['Membres Diaspora', '=COUNTIF(Responses!L:L,"etranger")', '50', '=B10/C10'],
    ['Taux Conversion Hot', '=IFERROR(B5/B4,0)', '30%', '=B11/C11'],
    ['', '', '', ''],
    ['Top 5 Quartiers', 'Nombre', '', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(FILTER(Responses!M:M,Responses!M:M<>"Quartier/Zone",Responses!M:M<>"",Responses!M:M<>"Diaspora")),1,TRUE),1),"N/A")', '=IFERROR(COUNTIF(Responses!M:M,A14),0)', '', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(FILTER(Responses!M:M,Responses!M:M<>"Quartier/Zone",Responses!M:M<>"",Responses!M:M<>"Diaspora")),1,TRUE),2),"N/A")', '=IFERROR(COUNTIF(Responses!M:M,A15),0)', '', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(FILTER(Responses!M:M,Responses!M:M<>"Quartier/Zone",Responses!M:M<>"",Responses!M:M<>"Diaspora")),1,TRUE),3),"N/A")', '=IFERROR(COUNTIF(Responses!M:M,A16),0)', '', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(FILTER(Responses!M:M,Responses!M:M<>"Quartier/Zone",Responses!M:M<>"",Responses!M:M<>"Diaspora")),1,TRUE),4),"N/A")', '=IFERROR(COUNTIF(Responses!M:M,A17),0)', '', ''],
    ['=IFERROR(INDEX(SORT(UNIQUE(FILTER(Responses!M:M,Responses!M:M<>"Quartier/Zone",Responses!M:M<>"",Responses!M:M<>"Diaspora")),1,TRUE),5),"N/A")', '=IFERROR(COUNTIF(Responses!M:M,A18),0)', '', ''],
    ['', '', '', ''],
    ['Tendance 7 derniers jours', '', '', ''],
    ['Date', 'Nouvelles réponses', 'Hot Leads', 'Diaspora'],
    ['=TODAY()-6', '=COUNTIFS(Responses!A:A,">="&A22,Responses!A:A,"<"&A22+1)', '=COUNTIFS(Responses!A:A,">="&A22,Responses!A:A,"<"&A22+1,Responses!C:C,">=70")', '=COUNTIFS(Responses!A:A,">="&A22,Responses!A:A,"<"&A22+1,Responses!L:L,"etranger")'],
    ['=TODAY()-5', '=COUNTIFS(Responses!A:A,">="&A23,Responses!A:A,"<"&A23+1)', '=COUNTIFS(Responses!A:A,">="&A23,Responses!A:A,"<"&A23+1,Responses!C:C,">=70")', '=COUNTIFS(Responses!A:A,">="&A23,Responses!A:A,"<"&A23+1,Responses!L:L,"etranger")'],
    ['=TODAY()-4', '=COUNTIFS(Responses!A:A,">="&A24,Responses!A:A,"<"&A24+1)', '=COUNTIFS(Responses!A:A,">="&A24,Responses!A:A,"<"&A24+1,Responses!C:C,">=70")', '=COUNTIFS(Responses!A:A,">="&A24,Responses!A:A,"<"&A24+1,Responses!L:L,"etranger")'],
    ['=TODAY()-3', '=COUNTIFS(Responses!A:A,">="&A25,Responses!A:A,"<"&A25+1)', '=COUNTIFS(Responses!A:A,">="&A25,Responses!A:A,"<"&A25+1,Responses!C:C,">=70")', '=COUNTIFS(Responses!A:A,">="&A25,Responses!A:A,"<"&A25+1,Responses!L:L,"etranger")'],
    ['=TODAY()-2', '=COUNTIFS(Responses!A:A,">="&A26,Responses!A:A,"<"&A26+1)', '=COUNTIFS(Responses!A:A,">="&A26,Responses!A:A,"<"&A26+1,Responses!C:C,">=70")', '=COUNTIFS(Responses!A:A,">="&A26,Responses!A:A,"<"&A26+1,Responses!L:L,"etranger")'],
    ['=TODAY()-1', '=COUNTIFS(Responses!A:A,">="&A27,Responses!A:A,"<"&A27+1)', '=COUNTIFS(Responses!A:A,">="&A27,Responses!A:A,"<"&A27+1,Responses!C:C,">=70")', '=COUNTIFS(Responses!A:A,">="&A27,Responses!A:A,"<"&A27+1,Responses!L:L,"etranger")'],
    ['=TODAY()', '=COUNTIFS(Responses!A:A,">="&A28,Responses!A:A,"<"&A28+1)', '=COUNTIFS(Responses!A:A,">="&A28,Responses!A:A,"<"&A28+1,Responses!C:C,">=70")', '=COUNTIFS(Responses!A:A,">="&A28,Responses!A:A,"<"&A28+1,Responses!L:L,"etranger")']
  ];
  
  sheet.getRange(1, 1, dashboard.length, 4).setValues(dashboard);
  sheet.getRange(1, 1, 1, 4).merge().setFontSize(18).setFontWeight('bold');
  sheet.getRange(3, 1, 1, 4).setFontWeight('bold').setBackground('#E8F5E9');
  
  // Format percentage cells
  sheet.getRange('D4:D11').setNumberFormat('0%');
  
  // Apply conditional formatting
  const rules = sheet.getConditionalFormatRules();
  
  // Green for values >= target
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange('D4:D11')])
    .whenNumberGreaterThanOrEqualTo(1)
    .setBackground('#D4EDDA')
    .build());
  
  // Yellow for 50-99% of target
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange('D4:D11')])
    .whenNumberBetween(0.5, 0.99)
    .setBackground('#FFF3CD')
    .build());
  
  // Red for <50% of target
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange('D4:D11')])
    .whenNumberLessThan(0.5)
    .setBackground('#F8D7DA')
    .build());
    
  sheet.setConditionalFormatRules(rules);
}

/**
 * Create Hot Leads filtered view - FIXED
 */
function createHotLeadsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.HOT_LEADS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.HOT_LEADS_SHEET);
  }
  
  // Add title
  sheet.getRange('A1').setValue('🔥 HOT LEADS (Score ≥ 70)');
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  // Add filter formula starting at row 3
  sheet.getRange('A3').setFormula(
    '=IFERROR(FILTER(Responses!A:BB, Responses!C:C>=70, ROW(Responses!A:A)>1), "Aucun hot lead trouvé")'
  );
  
  // Format header row
  sheet.getRange(3, 1, 1, 54)
    .setBackground('#E74C3C')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
}

/**
 * Create Diaspora filtered view - FIXED
 */
function createDiasporaSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.DIASPORA_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.DIASPORA_SHEET);
  }
  
  // Add title
  sheet.getRange('A1').setValue('🌍 MEMBRES DIASPORA');
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  // Add filter formula starting at row 3
  sheet.getRange('A3').setFormula(
    '=IFERROR(FILTER(Responses!A:BB, Responses!L:L="etranger", ROW(Responses!A:A)>1), "Aucun membre diaspora trouvé")'
  );
  
  // Format header row
  sheet.getRange(3, 1, 1, 54)
    .setBackground('#3498DB')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
}

/**
 * Calculate lead score based on responses - FIXED
 */
function calculateLeadScore(data) {
  let score = 0;
  
  // Interest score (1-5) × 10 points - FIXED field name
  const interest = parseInt(data.interet || data.score_interet || 0);
  score += interest * 10;
  
  // High budget = +20 points
  const highBudgets = ['35000-50000', '50000-75000', '75000+'];
  if (highBudgets.includes(data.budget_hebdo)) {
    score += 20;
  } else if (data.budget_hebdo === '20000-35000') {
    score += 10;
  }
  
  // Beta tester = +15 points
  if (data.beta_tester === true || data.beta_tester === 'true' || data.beta_tester === 'oui') {
    score += 15;
  }
  
  // High frequency = +15 points
  const highFreq = ['quotidien', '3-4fois', 'plusieurs_fois_semaine'];
  if (highFreq.includes(data.frequence_usage || data.freq_utilisation_diaspora)) {
    score += 15;
  } else if ((data.frequence_usage || data.freq_utilisation_diaspora) === '1-2fois' || (data.frequence_usage || data.freq_utilisation_diaspora) === 'une_fois_semaine') {
    score += 8;
  }
  
  // Diaspora specific scoring
  if (data.localisation === 'etranger') {
    // Diaspora user bonus
    score += 10;
    
    // Multiple beneficiaries bonus
    if (data.nombre_beneficiaires === '5+' || data.nombre_beneficiaires === '3-4') {
      score += 10;
    } else if (data.nombre_beneficiaires === '2') {
      score += 5;
    }
    
    // Service fee willingness
    if (data.frais_service_diaspora === '10000+' || data.frais_service_diaspora === '7500-10000') {
      score += 10;
    } else if (data.frais_service_diaspora === '5000-7500') {
      score += 5;
    }
    
    // Would recommend
    if (data.recommandation_diaspora === 'certainement') {
      score += 10;
    } else if (data.recommandation_diaspora === 'probablement') {
      score += 5;
    }
  } else {
    // Local user recommendation scoring
    if (data.recommandation_locale === 'certainement') {
      score += 10;
    } else if (data.recommandation_locale === 'probablement') {
      score += 5;
    }
  }
  
  return Math.min(100, score);
}

/**
 * Get lead segment based on score
 */
function getSegment(score) {
  if (score >= 70) return 'Hot Lead 🔥';
  if (score >= 40) return 'Warm Lead 🌡️';
  return 'Cold Lead ❄️';
}

/**
 * Handle POST request from the form - FIXED field mappings
 */
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get or create the spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET);
    
    // Initialize if needed
    if (!sheet || sheet.getLastRow() === 0) {
      sheet = initializeSpreadsheet();
    }
    
    // Check for duplicates
    const duplicate = checkDuplicate(sheet, data.telephone, data.email);
    
    if (duplicate) {
      // Return duplicate warning with existing promo code
      const daysSince = Math.floor((new Date() - new Date(duplicate.existingDate)) / (1000 * 60 * 60 * 24));
      
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          isDuplicate: true,
          message: `Vous avez déjà participé au sondage il y a ${daysSince} jour(s).`,
          promoCode: duplicate.existingPromo,
          matchType: duplicate.matchType,
          alreadySubmitted: true
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Calculate lead score and segment
    const leadScore = calculateLeadScore(data);
    const segment = getSegment(leadScore);
    const timestamp = new Date();
    const id = 'LKT' + Date.now();
    
    // Use promo code from frontend or generate new one
    const promoCode = data.promo_code || ('LK' + Math.random().toString(36).substr(2, 8).toUpperCase());
    
    // Prepare row data in EXACT order of headers
    const rowData = [
      // Metadata
      timestamp,
      id,
      leadScore,
      segment,
      'Nouveau',
      
      // Promo Code Fields
      promoCode,
      data.code_status || 'active',
      data.code_value || 2000,
      data.code_expiry || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      false, // Code Used
      '', // Code Used Date
      
      // Section 1: Profil
      data.localisation || '',
      data.quartier || '',
      data.diaspora_region || '',
      data.age || '',
      data.foyer_size || '',
      data.profession || '',
      
      // Section 2: Habitudes (N/A for diaspora)
      data.lieu_courses || '',
      data.frequence || data.frequence_courses || '',
      data.budget_hebdo || '',
      data.defis || '',
      
      // Section 3: Cuisine (N/A for diaspora)
      data.plats || '',
      data.freq_cuisine || '',
      data.qui_cuisine || '',
      
      // Section 4: Commande (N/A for diaspora)
      data.delai_commande || '',
      data.commande_auto || '',
      data.avantages_anticipe || '',
      data.delai_ideal || '',
      
      // Section 5: Concept (N/A for diaspora)
      data.interet || data.score_interet || '',
      data.attrait || '',
      data.service_prefere || '',
      
      // Section 6: Prix (N/A for diaspora)
      data.prix_min_pack || '',
      data.prix_max_pack || '',
      data.prix_livraison || '',
      data.frequence_usage || '',
      data.panier_moyen || '',
      
      // Section 7: Experience (N/A for diaspora)
      data.suggestions || '',
      data.inquietudes || '',
      
      // Section 8: Diaspora specific
      data.zones_famille || '', // zones famille au Sénégal
      data.fonctionnalites_essentielles || '',
      data.types_produits || '',
      data.preference_commande || '',
      data.frais_service_diaspora || '',
      data.freq_utilisation_diaspora || '',
      data.nombre_beneficiaires || '',
      
      // Section 9: Contact (all users)
      data.telephone || '',
      data.email || '',
      data.prenom || '',
      data.beta_tester === true || data.beta_tester === 'true' || data.beta_tester === 'oui',
      
      // Section 10: Final suggestions
      data.services_manquants || '',
      data.difficultes_diaspora || '',
      data.fonctionnalites_innovantes || '',
      data.recommandation_diaspora || '',
      data.suggestions_amelioration || '',
      data.services_souhaites || '',
      data.recommandation_locale || '',
      
      // Calculated fields
      Utilities.formatDate(timestamp, 'GMT+0', 'w'), // Week number
      Utilities.formatDate(timestamp, 'GMT+0', 'MMMM yyyy') // Month
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Apply formatting to the new row
    const lastRow = sheet.getLastRow();
    const scoreCell = sheet.getRange(lastRow, 3);
    
    // Color code based on lead score
    if (leadScore >= 70) {
      scoreCell.setBackground('#D4EDDA').setFontColor('#155724');
    } else if (leadScore >= 40) {
      scoreCell.setBackground('#FFF3CD').setFontColor('#856404');
    } else {
      scoreCell.setBackground('#F8D7DA').setFontColor('#721C24');
    }
    
    // Log for debugging
    console.log('Response saved:', id, 'Score:', leadScore);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Réponse enregistrée avec succès',
        leadScore: leadScore,
        segment: segment,
        promoCode: promoCode,
        recordId: id
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing submission:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Check for duplicate submissions
 */
function checkDuplicate(sheet, phone, email) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  
  // Find column indices - FIXED for new headers
  const phoneCol = headers.indexOf('Téléphone');
  const emailCol = headers.indexOf('Email');
  const timestampCol = headers.indexOf('Date de soumission');
  const promoCol = headers.indexOf('Code Promo');
  
  // Check each row for duplicates
  for (let i = 1; i < values.length; i++) {
    const rowPhone = values[i][phoneCol];
    const rowEmail = values[i][emailCol];
    
    // Check if phone matches
    if (phone && rowPhone && 
        phone.toString().replace(/\s/g, '') === rowPhone.toString().replace(/\s/g, '')) {
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

/**
 * GET endpoint to retrieve survey statistics
 */
function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.RESPONSES_SHEET);
    
    // Get participant count (minus header row)
    const participantCount = Math.max(0, sheet.getLastRow() - 1);
    
    // Handle different actions
    if (e.parameter.action === 'getStats') {
      // Return stats for closure screen
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          totalResponses: participantCount,
          lastUpdate: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Default response with detailed stats
    const stats = {
      status: 'active',
      message: 'Leeket Survey API',
      participants: participantCount,
      lastUpdate: new Date().toISOString()
    };
    
    // Add more stats if requested
    if (e.parameter.detailed === 'true' && sheet.getLastRow() > 1) {
      const data = sheet.getDataRange().getValues();
      let hotLeads = 0;
      let betaTesters = 0;
      let diaspora = 0;
      
      // Skip header row - FIXED column indices
      for (let i = 1; i < data.length; i++) {
        if (data[i][2] >= 70) hotLeads++; // Lead Score column (C)
        if (data[i][47] === true) betaTesters++; // Beta Tester column (AV)
        if (data[i][11] === 'etranger') diaspora++; // Type Utilisateur column (L)
      }
      
      stats.hotLeads = hotLeads;
      stats.betaTesters = betaTesters;
      stats.diasporaMembers = diaspora;
      stats.conversionRate = participantCount > 0 ? (hotLeads / participantCount * 100).toFixed(1) + '%' : '0%';
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(stats))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString(),
        participants: 0 // Return 0 on error, not fake number
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Manual function to set up the spreadsheet
 * Run this once from the Apps Script editor
 */
function setupSpreadsheet() {
  initializeSpreadsheet();
  
  // Add some formatting rules
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.RESPONSES_SHEET);
  
  // Alternate row colors
  const range = sheet.getRange(2, 1, 500, sheet.getLastColumn());
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=MOD(ROW(),2)=0')
    .setBackground('#F8F9FA')
    .setRanges([range])
    .build();
  
  const rules = sheet.getConditionalFormatRules();
  rules.push(rule);
  sheet.setConditionalFormatRules(rules);
  
  SpreadsheetApp.getUi().alert('✅ Configuration terminée avec succès!');
}