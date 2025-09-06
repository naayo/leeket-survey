/**
 * Google Apps Script for Leeket Survey
 * This script handles form submissions from your custom survey form
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

// Configuration - Update these with your sheet names
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
  
  // Set headers for main responses sheet
  const headers = [
    // Metadata
    'Timestamp',
    'ID',
    'Lead Score',
    'Segment',
    'Status',
    
    // Section 1: Profil avec détection précoce
    'Localisation', // senegal/etranger
    'Quartier', // LOCAL: quartier de résidence
    'Pays Residence', // DIASPORA: pays de résidence
    'Age',
    'Taille Foyer',
    'Profession',
    
    // Section 2: Habitudes
    'Lieux Courses',
    'Frequence Courses',
    'Budget Hebdo',
    'Defis',
    
    // Section 3: Cuisine
    'Plats Préférés',
    'Frequence Cuisine',
    'Qui Cuisine',
    
    // Section 4: Commande
    'Delai Commande',
    'Commande Auto',
    'Avantages Anticipe',
    'Delai Ideal',
    
    // Section 5: Concept
    'Score Interet',
    'Attrait',
    'Service Prefere',
    
    // Section 6: Prix
    'Prix Min Pack',
    'Prix Max Pack',
    'Prix Livraison',
    'Frequence Usage',
    'Panier Moyen',
    
    // Section 7: Contact
    'Suggestions',
    'Inquietudes',
    'Telephone',
    'Email',
    'Prenom',
    'Beta Tester',
    
    // Section 8: Zones ou Intérêts
    'Zones Livraison', // LOCAL: zones de livraison souhaitées
    'Diaspora Location', // DIASPORA: europe/amerique_nord/ailleurs
    'Interet Commande Proches', // DIASPORA: intérêt pour commander
    'Occasions Utilisation', // DIASPORA: occasions d'usage
    
    // Section 9: Services souhaités
    'Suggestions Locaux', // LOCAL: suggestions générales
    'Fonctionnalites Essentielles', // DIASPORA: fonctionnalités importantes
    'Types Produits', // DIASPORA: types de produits souhaités
    'Preference Commande', // DIASPORA: comment organiser commandes
    
    // Section 10: Suggestions finales
    'Services Manquants', // DIASPORA: services manquants
    'Difficultes Diaspora', // DIASPORA: difficultés rencontrées
    'Fonctionnalites Innovantes', // DIASPORA: idées innovantes
    'Recommandation Diaspora', // DIASPORA: recommandation
    'Suggestions Amelioration', // LOCAL: suggestions amélioration
    'Services Souhaites', // LOCAL: services souhaités
    'Recommandation Locale', // LOCAL: recommandation
    
    // Calculated
    'Promo Code',
    'Date Added',
    'Week Number',
    'Month'
  ];
  
  responsesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  responsesSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  responsesSheet.setFrozenRows(1);
  
  // Format the sheet
  responsesSheet.getRange(1, 1, 1, headers.length)
    .setBackground('#2ECC71')
    .setFontColor('#FFFFFF');
  
  // Create Analytics sheet
  createAnalyticsSheet(ss);
  
  // Create Hot Leads view
  createHotLeadsSheet(ss);
  
  // Create Diaspora view
  createDiasporaSheet(ss);
  
  return responsesSheet;
}

/**
 * Create analytics dashboard sheet
 */
function createAnalyticsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.ANALYTICS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.ANALYTICS_SHEET);
  }
  
  const dashboard = [
    ['Leeket Survey - Analytics Dashboard', '', '', ''],
    ['', '', '', ''],
    ['Metric', 'Value', 'Change', 'Target'],
    ['Total Responses', '=COUNTA(Responses!A:A)-1', '', '500'],
    ['Hot Leads (70+)', '=COUNTIF(Responses!C:C,">=70")', '', '150'],
    ['Warm Leads (40-69)', '=COUNTIFS(Responses!C:C,">=40",Responses!C:C,"<70")', '', '200'],
    ['Cold Leads (<40)', '=COUNTIF(Responses!C:C,"<40")', '', ''],
    ['Average Lead Score', '=AVERAGE(Responses!C:C)', '', '60'],
    ['Beta Testers', '=COUNTIF(Responses!AH:AH,TRUE)', '', '100'],
    ['Diaspora Members', '=COUNTIF(Responses!AI:AI,"oui")', '', ''],
    ['Conversion Rate', '=COUNTIF(Responses!E:E,"Converti")/COUNTA(Responses!A:A)', '', '10%'],
    ['', '', '', ''],
    ['Top Quartiers', 'Count', '', ''],
    ['=SORT(UNIQUE(FILTER(Responses!F:F,Responses!F:F<>"Quartier",Responses!F:F<>"")),1,TRUE)', '=COUNTIF(Responses!F:F,A14)', '', ''],
    ['', '', '', ''],
    ['Weekly Trend', 'Week', 'Responses', 'Hot Leads'],
    ['', '=WEEKNUM(TODAY())-3', '=COUNTIFS(Responses!AV:AV,B17)', '=COUNTIFS(Responses!AV:AV,B17,Responses!C:C,">=70")'],
    ['', '=WEEKNUM(TODAY())-2', '=COUNTIFS(Responses!AV:AV,B18)', '=COUNTIFS(Responses!AV:AV,B18,Responses!C:C,">=70")'],
    ['', '=WEEKNUM(TODAY())-1', '=COUNTIFS(Responses!AV:AV,B19)', '=COUNTIFS(Responses!AV:AV,B19,Responses!C:C,">=70")'],
    ['', '=WEEKNUM(TODAY())', '=COUNTIFS(Responses!AV:AV,B20)', '=COUNTIFS(Responses!AV:AV,B20,Responses!C:C,">=70")']
  ];
  
  sheet.getRange(1, 1, dashboard.length, 4).setValues(dashboard);
  sheet.getRange(1, 1, 1, 4).merge().setFontSize(18).setFontWeight('bold');
  sheet.getRange(3, 1, 1, 4).setFontWeight('bold').setBackground('#E8F5E9');
  
  // Apply conditional formatting for metrics
  const rules = sheet.getConditionalFormatRules();
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .setRanges([sheet.getRange('B4:B11')])
    .whenNumberGreaterThanOrEqualTo(50)
    .setFontColor('#2ECC71')
    .build());
  sheet.setConditionalFormatRules(rules);
}

/**
 * Create Hot Leads filtered view
 */
function createHotLeadsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.HOT_LEADS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.HOT_LEADS_SHEET);
  }
  
  // Add formula to pull hot leads
  sheet.getRange('A1').setFormula(
    '=FILTER(Responses!A:AW, Responses!C:C>=70, Responses!A:A<>"Timestamp")'
  );
  
  // Format header
  sheet.getRange(1, 1, 1, 50)
    .setBackground('#E74C3C')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
}

/**
 * Create Diaspora filtered view
 */
function createDiasporaSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.DIASPORA_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.DIASPORA_SHEET);
  }
  
  // Add formula to pull diaspora members
  sheet.getRange('A1').setFormula(
    '=FILTER(Responses!A:AW, Responses!AI:AI="oui", Responses!A:A<>"Timestamp")'
  );
  
  // Format header
  sheet.getRange(1, 1, 1, 50)
    .setBackground('#3498DB')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
}

/**
 * Calculate lead score based on responses
 */
function calculateLeadScore(data) {
  let score = 0;
  
  // Interest score (1-5) × 10 points
  const interest = parseInt(data.interet) || 0;
  score += interest * 10;
  
  // High budget = +20 points
  const highBudgets = ['35000-50000', '50000-75000', '75000+'];
  if (highBudgets.includes(data.budget_hebdo)) {
    score += 20;
  } else if (data.budget_hebdo === '20000-35000') {
    score += 10;
  }
  
  // Beta tester = +15 points
  if (data.beta_tester === 'true' || data.beta_tester === true) {
    score += 15;
  }
  
  // High frequency = +15 points
  const highFreq = ['quotidien', '3-4fois'];
  if (highFreq.includes(data.frequence_usage)) {
    score += 15;
  } else if (data.frequence_usage === '1-2fois') {
    score += 8;
  }
  
  // Diaspora or Local specific scoring
  if (data.localisation === 'etranger') {
    // Diaspora user bonus
    score += 10;
    
    // High interest in ordering for family
    if (data.interet_commande_proches === 'tres_interesse') {
      score += 15;
    } else if (data.interet_commande_proches === 'plutot_interesse') {
      score += 10;
    } else if (data.interet_commande_proches === 'peut_etre') {
      score += 5;
    }
    
    // Would recommend to others
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
 * Generate promo code
 */
function generatePromoCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'LEEKET';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Check for duplicate submissions
 */
function checkDuplicate(sheet, phone, email) {
  if (!sheet || sheet.getLastRow() < 2) return null;
  
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const headers = values[0];
  
  // Find column indices
  const phoneCol = headers.indexOf('Telephone');
  const emailCol = headers.indexOf('Email');
  const timestampCol = headers.indexOf('Timestamp');
  const promoCol = headers.indexOf('Promo Code');
  
  // Check each row for duplicates
  for (let i = 1; i < values.length; i++) {
    const rowPhone = values[i][phoneCol];
    const rowEmail = values[i][emailCol];
    
    // Check if phone matches (required field)
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
    
    // Check if email matches (if provided)
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
 * Handle POST request from the form
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
    const promoCode = generatePromoCode();
    const timestamp = new Date();
    const id = 'LKT' + Date.now();
    
    // Prepare row data in the exact order of headers
    const rowData = [
      // Metadata
      timestamp,
      id,
      leadScore,
      segment,
      'Nouveau',
      
      // Section 1: Profil
      data.quartier || '',
      data.age || '',
      data.foyer_size || '',
      data.profession || '',
      
      // Section 2: Habitudes
      data.lieu_courses || '',
      data.frequence || '',
      data.budget_hebdo || '',
      data.defis || '',
      
      // Section 3: Cuisine
      data.plats || '',
      data.freq_cuisine || '',
      data.qui_cuisine || '',
      
      // Section 4: Commande
      data.delai_commande || '',
      data.commande_auto || '',
      data.avantages_anticipe || '',
      data.delai_ideal || '',
      
      // Section 5: Concept
      data.interet || '',
      data.attrait || '',
      data.service_prefere || '',
      
      // Section 6: Prix
      data.prix_min_pack || '',
      data.prix_max_pack || '',
      data.prix_livraison || '',
      data.frequence_usage || '',
      data.panier_moyen || '',
      
      // Section 7: Contact
      data.suggestions || '',
      data.inquietudes || '',
      data.telephone || '',
      data.email || '',
      data.prenom || '',
      data.beta_tester === 'true' || data.beta_tester === true,
      
      // Section 8-9: Diaspora
      data.est_diaspora || '',
      data.pays_residence || '',
      data.freq_aide_alimentaire || '',
      data.methode_aide_actuelle || '',
      data.budget_aide_mensuel || '',
      data.interet_diaspora || '',
      data.fonctionnalites_diaspora || '',
      data.frais_service_diaspora || '',
      data.freq_utilisation_diaspora || '',
      data.beneficiaire_quartier || '',
      data.nombre_beneficiaires || '',
      
      // Calculated
      promoCode,
      timestamp,
      Utilities.formatDate(timestamp, 'GMT+0', 'w'),
      Utilities.formatDate(timestamp, 'GMT+0', 'MMMM yyyy')
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
    
    // Default response
    const stats = {
      status: 'active',
      message: 'Leeket Survey API',
      participants: participantCount,
      lastUpdate: new Date().toISOString()
    };
    
    // Add more stats if requested
    if (e.parameter.detailed === 'true') {
      const data = sheet.getDataRange().getValues();
      let hotLeads = 0;
      let betaTesters = 0;
      let diaspora = 0;
      
      // Skip header row
      for (let i = 1; i < data.length; i++) {
        if (data[i][2] >= 70) hotLeads++; // Lead Score column
        if (data[i][34] === true) betaTesters++; // Beta Tester column
        if (data[i][35] === 'oui') diaspora++; // Est Diaspora column
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
        participants: 250 // Default fallback
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
  
  SpreadsheetApp.getUi().alert('✅ Spreadsheet setup complete!');
}