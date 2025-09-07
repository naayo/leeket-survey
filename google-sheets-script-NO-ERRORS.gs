/**
 * UPDATED Analytics Sheet Creation - Handles Empty Data Gracefully
 * Replace only the createAnalyticsSheet function in your existing script
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
    // Use IFERROR to handle empty data
    ['Total Réponses', '=IFERROR(COUNTA(Responses!A:A)-1, 0)', '500', '=IFERROR(B4/C4, 0)'],
    ['Hot Leads (70+)', '=IFERROR(COUNTIF(Responses!C:C,">=70"), 0)', '150', '=IFERROR(B5/C5, 0)'],
    ['Warm Leads (40-69)', '=IFERROR(COUNTIFS(Responses!C:C,">=40",Responses!C:C,"<70"), 0)', '200', '=IFERROR(B6/C6, 0)'],
    ['Cold Leads (<40)', '=IFERROR(COUNTIF(Responses!C:C,"<40"), 0)', '-', ''],
    ['Score Lead Moyen', '=IFERROR(AVERAGE(Responses!C:C), 0)', '60', '=IFERROR(B8/C8, 0)'],
    ['Beta Testeurs', '=IFERROR(COUNTIF(Responses!AV:AV,TRUE), 0)', '100', '=IFERROR(B9/C9, 0)'],
    ['Membres Diaspora', '=IFERROR(COUNTIF(Responses!L:L,"etranger"), 0)', '50', '=IFERROR(B10/C10, 0)'],
    ['Taux Conversion Hot', '=IFERROR(IF(B4>0, B5/B4, 0), 0)', '30%', '=IFERROR(B11/C11, 0)'],
    ['', '', '', ''],
    ['Top 5 Quartiers', 'Nombre', '', ''],
    // Simplified quartier formulas that won't error when empty
    ['', '=IFERROR(COUNTIF(Responses!M:M, IF(COUNTA(Responses!M:M)>1, INDEX(UNIQUE(FILTER(Responses!M:M, Responses!M:M<>"Quartier/Zone", Responses!M:M<>"")), 1), "")), 0)', '', ''],
    ['', '=IFERROR(COUNTIF(Responses!M:M, IF(COUNTA(Responses!M:M)>1, INDEX(UNIQUE(FILTER(Responses!M:M, Responses!M:M<>"Quartier/Zone", Responses!M:M<>"")), 2), "")), 0)', '', ''],
    ['', '=IFERROR(COUNTIF(Responses!M:M, IF(COUNTA(Responses!M:M)>1, INDEX(UNIQUE(FILTER(Responses!M:M, Responses!M:M<>"Quartier/Zone", Responses!M:M<>"")), 3), "")), 0)', '', ''],
    ['', '=IFERROR(COUNTIF(Responses!M:M, IF(COUNTA(Responses!M:M)>1, INDEX(UNIQUE(FILTER(Responses!M:M, Responses!M:M<>"Quartier/Zone", Responses!M:M<>"")), 4), "")), 0)', '', ''],
    ['', '=IFERROR(COUNTIF(Responses!M:M, IF(COUNTA(Responses!M:M)>1, INDEX(UNIQUE(FILTER(Responses!M:M, Responses!M:M<>"Quartier/Zone", Responses!M:M<>"")), 5), "")), 0)', '', ''],
    ['', '', '', ''],
    ['Tendance 7 derniers jours', '', '', ''],
    ['Date', 'Nouvelles réponses', 'Hot Leads', 'Diaspora'],
    ['=TODAY()-6', '=IFERROR(COUNTIFS(Responses!A:A,">="&A22,Responses!A:A,"<"&A22+1), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A22,Responses!A:A,"<"&A22+1,Responses!C:C,">=70"), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A22,Responses!A:A,"<"&A22+1,Responses!L:L,"etranger"), 0)'],
    ['=TODAY()-5', '=IFERROR(COUNTIFS(Responses!A:A,">="&A23,Responses!A:A,"<"&A23+1), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A23,Responses!A:A,"<"&A23+1,Responses!C:C,">=70"), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A23,Responses!A:A,"<"&A23+1,Responses!L:L,"etranger"), 0)'],
    ['=TODAY()-4', '=IFERROR(COUNTIFS(Responses!A:A,">="&A24,Responses!A:A,"<"&A24+1), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A24,Responses!A:A,"<"&A24+1,Responses!C:C,">=70"), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A24,Responses!A:A,"<"&A24+1,Responses!L:L,"etranger"), 0)'],
    ['=TODAY()-3', '=IFERROR(COUNTIFS(Responses!A:A,">="&A25,Responses!A:A,"<"&A25+1), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A25,Responses!A:A,"<"&A25+1,Responses!C:C,">=70"), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A25,Responses!A:A,"<"&A25+1,Responses!L:L,"etranger"), 0)'],
    ['=TODAY()-2', '=IFERROR(COUNTIFS(Responses!A:A,">="&A26,Responses!A:A,"<"&A26+1), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A26,Responses!A:A,"<"&A26+1,Responses!C:C,">=70"), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A26,Responses!A:A,"<"&A26+1,Responses!L:L,"etranger"), 0)'],
    ['=TODAY()-1', '=IFERROR(COUNTIFS(Responses!A:A,">="&A27,Responses!A:A,"<"&A27+1), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A27,Responses!A:A,"<"&A27+1,Responses!C:C,">=70"), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A27,Responses!A:A,"<"&A27+1,Responses!L:L,"etranger"), 0)'],
    ['=TODAY()', '=IFERROR(COUNTIFS(Responses!A:A,">="&A28,Responses!A:A,"<"&A28+1), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A28,Responses!A:A,"<"&A28+1,Responses!C:C,">=70"), 0)', '=IFERROR(COUNTIFS(Responses!A:A,">="&A28,Responses!A:A,"<"&A28+1,Responses!L:L,"etranger"), 0)']
  ];
  
  sheet.getRange(1, 1, dashboard.length, 4).setValues(dashboard);
  sheet.getRange(1, 1, 1, 4).merge().setFontSize(18).setFontWeight('bold');
  sheet.getRange(3, 1, 1, 4).setFontWeight('bold').setBackground('#E8F5E9');
  
  // Format percentage cells
  sheet.getRange('D4:D11').setNumberFormat('0%');
  
  // Apply conditional formatting (will work even with 0 values)
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
 * UPDATED Hot Leads Sheet - Shows friendly message when empty
 */
function createHotLeadsSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.HOT_LEADS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.HOT_LEADS_SHEET);
  }
  
  // Add title
  sheet.getRange('A1').setValue('🔥 HOT LEADS (Score ≥ 70)');
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  // Add headers from Responses sheet if they exist
  sheet.getRange('A3').setFormula(
    '=IF(COUNTA(Responses!A:A)>1, FILTER(Responses!A1:BB1, LEN(Responses!A1:BB1)>0), "En attente des premières réponses...")'
  );
  
  // Add filter formula starting at row 4 with better error handling
  sheet.getRange('A4').setFormula(
    '=IF(COUNTIF(Responses!C:C,">=70")>0, FILTER(Responses!A2:BB, Responses!C2:C>=70), "")'
  );
  
  // Format header row
  sheet.getRange(3, 1, 1, 54)
    .setBackground('#E74C3C')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
}

/**
 * UPDATED Diaspora Sheet - Shows friendly message when empty
 */
function createDiasporaSheet(ss) {
  let sheet = ss.getSheetByName(CONFIG.DIASPORA_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.DIASPORA_SHEET);
  }
  
  // Add title
  sheet.getRange('A1').setValue('🌍 MEMBRES DIASPORA');
  sheet.getRange('A1').setFontSize(16).setFontWeight('bold');
  
  // Add headers from Responses sheet if they exist
  sheet.getRange('A3').setFormula(
    '=IF(COUNTA(Responses!A:A)>1, FILTER(Responses!A1:BB1, LEN(Responses!A1:BB1)>0), "En attente des membres diaspora...")'
  );
  
  // Add filter formula starting at row 4 with better error handling
  sheet.getRange('A4').setFormula(
    '=IF(COUNTIF(Responses!L:L,"etranger")>0, FILTER(Responses!A2:BB, Responses!L2:L="etranger"), "")'
  );
  
  // Format header row
  sheet.getRange(3, 1, 1, 54)
    .setBackground('#3498DB')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
}

/**
 * Add this function to your script and run it once to fix the sheets
 */
function fixAnalyticsErrors() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Recreate sheets with error handling
  createAnalyticsSheet(ss);
  createHotLeadsSheet(ss);
  createDiasporaSheet(ss);
  
  SpreadsheetApp.getUi().alert('✅ Formules corrigées! Les erreurs disparaîtront quand vous aurez des données.');
}