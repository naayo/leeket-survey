// Netlify serverless function for Airtable integration
const fetch = require('node-fetch');

// Headers for CORS
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Calculate lead score based on survey responses
function calculateLeadScore(data) {
    let score = 0;
    
    // Interest score (1-5) × 10 points (max 50)
    const interestScore = parseInt(data.interet) || 0;
    score += interestScore * 10;
    
    // High budget = +20 points
    const highBudgets = ['35000-50000', '50000-75000', '75000+'];
    if (highBudgets.includes(data.budget_hebdo)) {
        score += 20;
    } else if (data.budget_hebdo === '20000-35000') {
        score += 10;
    }
    
    // Beta tester = +15 points
    if (data.beta_tester === true || data.beta_tester === 'true') {
        score += 15;
    }
    
    // High frequency usage = +15 points
    const highFrequency = ['quotidien', '3-4fois'];
    if (highFrequency.includes(data.frequence_usage)) {
        score += 15;
    } else if (data.frequence_usage === '1-2fois') {
        score += 8;
    }
    
    // Diaspora bonus points
    if (data.est_diaspora === 'oui') {
        // Diaspora member = +10 points
        score += 10;
        
        // High diaspora interest = extra points
        const diasporaInterest = parseInt(data.interet_diaspora) || 0;
        if (diasporaInterest >= 4) {
            score += 10;
        } else if (diasporaInterest === 3) {
            score += 5;
        }
        
        // High diaspora budget = extra points
        const highDiasporaBudgets = ['200-300', '300-500', '500+'];
        if (highDiasporaBudgets.includes(data.budget_aide_mensuel)) {
            score += 10;
        }
    }
    
    return Math.min(100, score); // Cap at 100
}

// Determine lead segment based on score
function getLeadSegment(score) {
    if (score >= 70) return 'Hot Lead';
    if (score >= 40) return 'Warm Lead';
    return 'Cold Lead';
}

// Validate required fields
function validateData(data) {
    const requiredFields = ['quartier', 'age', 'foyer_size', 'profession', 'telephone'];
    const missingFields = [];
    
    for (const field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            missingFields.push(field);
        }
    }
    
    if (missingFields.length > 0) {
        throw new Error(`Champs requis manquants: ${missingFields.join(', ')}`);
    }
    
    // Validate phone number (Senegalese format)
    const phoneRegex = /^(77|78|76|70|75)[0-9]{7}$/;
    const cleanPhone = data.telephone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone)) {
        throw new Error('Numéro de téléphone invalide. Format attendu: 77 XXX XX XX');
    }
    
    return true;
}

// Format data for Airtable
function formatForAirtable(data) {
    // Calculate scores
    const leadScore = calculateLeadScore(data);
    const segment = getLeadSegment(leadScore);
    
    // Clean phone number
    const cleanPhone = data.telephone.replace(/\s/g, '');
    
    // Convert number fields
    const prixMinPack = parseInt(data.prix_min_pack) || 0;
    const prixMaxPack = parseInt(data.prix_max_pack) || 0;
    const scoreInteret = parseInt(data.interet) || 0;
    
    return {
        fields: {
            'Timestamp': data.timestamp || new Date().toISOString(),
            'Quartier': data.quartier || '',
            'Age': data.age || '',
            'Taille Foyer': data.foyer_size || '',
            'Profession': data.profession || '',
            'Lieux Courses': data.lieu_courses || '',
            'Frequence Courses': data.frequence || '',
            'Budget Hebdo': data.budget_hebdo || '',
            'Defis': data.defis || '',
            'Plats Préférés': data.plats || '',
            'Frequence Cuisine': data.freq_cuisine || '',
            'Qui Cuisine': data.qui_cuisine || '',
            'Delai Commande': data.delai_commande || '',
            'Commande Auto': data.commande_auto || '',
            'Avantages Anticipe': data.avantages_anticipe || '',
            'Delai Ideal': data.delai_ideal || '',
            'Score Interet': scoreInteret,
            'Attrait': data.attrait || '',
            'Service Prefere': data.service_prefere || '',
            'Prix Min Pack': prixMinPack,
            'Prix Max Pack': prixMaxPack,
            'Prix Livraison': data.prix_livraison || '',
            'Frequence Usage': data.frequence_usage || '',
            'Panier Moyen': data.panier_moyen || '',
            'Suggestions': data.suggestions || '',
            'Inquietudes': data.inquietudes || '',
            'Telephone': cleanPhone,
            'Email': data.email || '',
            'Prenom': data.prenom || '',
            'Beta Tester': data.beta_tester === true || data.beta_tester === 'true',
            'Lead Score': leadScore,
            'Segment': segment,
            'Status': 'Nouveau',
            // Diaspora fields
            'Est Diaspora': data.est_diaspora || '',
            'Pays Residence': data.pays_residence || '',
            'Freq Aide Alimentaire': data.freq_aide_alimentaire || '',
            'Methode Aide Actuelle': data.methode_aide_actuelle || '',
            'Budget Aide Mensuel': data.budget_aide_mensuel || '',
            'Interet Diaspora': parseInt(data.interet_diaspora) || 0,
            'Fonctionnalites Diaspora': data.fonctionnalites_diaspora || '',
            'Frais Service Diaspora': data.frais_service_diaspora || '',
            'Freq Utilisation Diaspora': data.freq_utilisation_diaspora || '',
            'Beneficiaire Quartier': data.beneficiaire_quartier || '',
            'Nombre Beneficiaires': parseInt(data.nombre_beneficiaires) || 0
        }
    };
}

// Main handler function
exports.handler = async (event, context) => {
    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    
    try {
        // Parse request body
        const data = JSON.parse(event.body);
        
        // Validate required fields
        validateData(data);
        
        // Check for Airtable credentials
        const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;
        
        if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
            throw new Error('Configuration Airtable manquante');
        }
        
        const tableName = AIRTABLE_TABLE_NAME || 'Responses';
        
        // Format data for Airtable
        const airtableData = formatForAirtable(data);
        
        // Send to Airtable
        const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
        
        const response = await fetch(airtableUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtableData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Airtable error:', errorText);
            throw new Error(`Erreur Airtable: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Generate promo code
        const promoCode = `LEEKET${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        // Return success response
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Formulaire envoyé avec succès',
                promoCode: promoCode,
                leadScore: airtableData.fields['Lead Score'],
                segment: airtableData.fields['Segment'],
                recordId: result.id
            })
        };
        
    } catch (error) {
        console.error('Error processing survey:', error);
        
        return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message || 'Une erreur est survenue'
            })
        };
    }
};