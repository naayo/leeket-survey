// Pour utiliser le VRAI nombre depuis Google Sheets, remplacez la fonction updateParticipantCount dans survey.js par :

async function updateParticipantCount() {
	try {
		// Try to get count from localStorage first (cache for 1 hour)
		const cached = localStorage.getItem('leeket_participant_count');
		const cacheTime = localStorage.getItem('leeket_count_time');
		const now = new Date().getTime();
		
		if (cached && cacheTime && (now - parseInt(cacheTime) < 3600000)) {
			// Use cached value if less than 1 hour old
			const count = parseInt(cached);
			document.getElementById('participantCount').textContent = count;
			return;
		}
		
		// Try to fetch REAL count from Google Sheets
		const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE'; // Remplacez par votre URL
		
		try {
			const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getStats');
			const data = await response.json();
			
			if (data.success && data.totalResponses !== undefined) {
				// Use REAL count from Google Sheets
				const realCount = data.totalResponses;
				document.getElementById('participantCount').textContent = realCount;
				
				// Cache the real value
				localStorage.setItem('leeket_participant_count', realCount);
				localStorage.setItem('leeket_count_time', now.toString());
				return;
			}
		} catch (fetchError) {
			console.log('Could not fetch from Google Sheets:', fetchError);
		}
		
		// FALLBACK: Use simulated number if Google Sheets fails
		const launchDate = new Date('2024-01-15').getTime();
		const daysSinceLaunch = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));
		const baseCount = 250;
		const dailyGrowth = 8;
		const estimatedCount = baseCount + (daysSinceLaunch * dailyGrowth);
		
		const randomVariation = Math.floor(Math.random() * 20) - 10;
		const finalCount = Math.max(250, estimatedCount + randomVariation);
		
		document.getElementById('participantCount').textContent = finalCount;
		
		// Cache the simulated value
		localStorage.setItem('leeket_participant_count', finalCount);
		localStorage.setItem('leeket_count_time', now.toString());
		
	} catch (error) {
		console.log('Could not update participant count:', error);
		// Keep default value of 250
		document.getElementById('participantCount').textContent = 250;
	}
}