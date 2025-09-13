/**
 * Survey Configuration File
 * Modify this file to control survey status and settings
 */

const SURVEY_CONFIG = {
	// Survey Status - Change to 'closed' to close the survey
	status: 'open', // Options: 'open', 'closed'

	// Closure date (optional - for automatic closure)
	closureDate: null, // Example: '2024-12-31T23:59:59'

	// Target number of responses (optional - for automatic closure)
	targetResponses: 5000, // Will close after reaching this number

	// Duplicate submission settings
	duplicateDetection: {
		enabled: false, // Set to false to allow duplicate submissions
		checkPhone: false, // Check for duplicate phone numbers
		checkEmail: true, // Check for duplicate emails
		message: 'Vous avez déjà participé au sondage', // Custom duplicate message
		showExistingPromo: true, // Show existing promo code to returning users
	},

	// Messages
	messages: {
		closureTitle: '✓ Merci pour votre participation !',
		closureMessage: 'Le formulaire est maintenant clos.',
		closureSubtext: 'Vos réponses nous aident à construire un marché digital plus simple et plus proche de vous.',
		closureFooter: 'Rendez-vous très bientôt pour le lancement officiel de Leeket - avec vos idées intégrées.',
		closureContact: "Pour plus d'informations : contact@leeket.sn",
	},

	// Countdown settings
	showCountdown: true, // Show countdown when survey is about to close
	countdownDays: 3, // Start showing countdown X days before closure

	// Override settings (for testing)
	forceOpen: false, // Set to true to keep survey open regardless of other settings
	forceClosed: false, // Set to true to force survey closed for testing
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
	module.exports = SURVEY_CONFIG;
}
