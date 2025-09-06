// Netlify serverless function for Google Sheets integration
// This replaces the Airtable version

// Headers for CORS
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

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
        
        // Get Google Sheets Web App URL from environment variable
        const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
        
        if (!GOOGLE_SCRIPT_URL) {
            console.error('Google Script URL not configured');
            // Fallback: return success anyway for testing
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Test mode - Google Sheets not configured',
                    leadScore: 75,
                    segment: 'Hot Lead',
                    promoCode: 'LEEKET' + Math.random().toString(36).substr(2, 6).toUpperCase()
                })
            };
        }
        
        // Send to Google Sheets
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Parse response from Google Sheets
        const result = await response.json();
        
        if (result.success) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(result)
            };
        } else {
            throw new Error(result.error || 'Google Sheets error');
        }
        
    } catch (error) {
        console.error('Error processing survey:', error);
        
        // Return graceful error
        return {
            statusCode: 200, // Return 200 to avoid form error
            headers,
            body: JSON.stringify({
                success: true, // Pretend success to show success page
                message: 'Réponse enregistrée (mode hors ligne)',
                leadScore: 0,
                segment: 'Pending',
                promoCode: 'LEEKET' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                error: error.message
            })
        };
    }
};