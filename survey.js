// Survey form JavaScript with Netlify Functions integration
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxTrEqoLprfcDNVNdbIC-ZIIpg_wTtoNk5Ux3l9Has/exec';
const form = document.getElementById('surveyForm');
const sections = document.querySelectorAll('.section');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const currentQSpan = document.getElementById('currentQ');
const btnPrevious = document.getElementById('btnPrevious');
const btnNext = document.getElementById('btnNext');
const btnSubmit = document.getElementById('btnSubmit');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');

let currentSection = 1;
let totalSections = 9; // Fixed to 9 since everyone sees section 8
let isDiaspora = false;

// Initialize radio and checkbox styling
document.querySelectorAll('.radio-item input, .checkbox-item input').forEach(input => {
	input.addEventListener('change', function () {
		const parent = this.closest('.radio-item, .checkbox-item');

		if (this.type === 'radio') {
			const siblings = parent.parentElement.querySelectorAll('.radio-item');
			siblings.forEach(sibling => sibling.classList.remove('selected'));
		}

		if (this.checked) {
			parent.classList.add('selected');
		} else {
			parent.classList.remove('selected');
		}
	});
});

// Dish selection limit (max 7)
const dishCheckboxes = document.querySelectorAll('.dish-item input');
dishCheckboxes.forEach(checkbox => {
	checkbox.addEventListener('change', function () {
		const parent = this.closest('.dish-item');
		const checkedCount = document.querySelectorAll('.dish-item input:checked').length;

		if (checkedCount > 7) {
			this.checked = false;
			alert('Vous pouvez choisir maximum 7 plats');
			return;
		}

		if (this.checked) {
			parent.classList.add('selected');
		} else {
			parent.classList.remove('selected');
		}
	});
});

// Limit checkboxes for advantages and attractions (max 3)
['attrait', 'avantages_anticipe', 'fonctionnalites_diaspora'].forEach(name => {
	const checkboxes = document.querySelectorAll(`input[name="${name}"]`);
	checkboxes.forEach(checkbox => {
		checkbox.addEventListener('change', function () {
			const checkedCount = document.querySelectorAll(`input[name="${name}"]:checked`).length;

			if (checkedCount > 3) {
				this.checked = false;
				alert('Vous pouvez choisir maximum 3 options');
				return;
			}
		});
	});
});

// Handle diaspora question logic
const diasporaRadios = document.querySelectorAll('input[name="est_diaspora"]');
const totalQSpan = document.getElementById('totalQ');

diasporaRadios.forEach(radio => {
	radio.addEventListener('change', function () {
		isDiaspora = this.value === 'oui';

		// Show/hide diaspora-specific fields
		const diasporaOnlyFields = document.querySelectorAll('.diaspora-only');
		const nonDiasporaFields = document.querySelectorAll('.non-diaspora-only');

		if (isDiaspora) {
			// Show diaspora fields
			diasporaOnlyFields.forEach(field => {
				field.style.display = 'block';
				// Make required fields required
				const requiredInputs = field.querySelectorAll(
					'select[name="pays_residence"], input[name="freq_aide_alimentaire"], input[name="interet_diaspora"]'
				);
				requiredInputs.forEach(input => input.setAttribute('required', 'required'));
			});
			nonDiasporaFields.forEach(field => (field.style.display = 'none'));

			// Update total sections to include diaspora sections
			totalSections = 9;
			if (totalQSpan) totalQSpan.textContent = '9';
		} else {
			// Hide diaspora fields
			diasporaOnlyFields.forEach(field => {
				field.style.display = 'none';
				// Remove required attribute from hidden fields
				const requiredInputs = field.querySelectorAll('[required]');
				requiredInputs.forEach(input => input.removeAttribute('required'));
			});
			nonDiasporaFields.forEach(field => (field.style.display = 'block'));

			// Update total sections to exclude pure diaspora section
			totalSections = 9; // Still show section 8 to ask if diaspora, but section 9 will be minimal
			if (totalQSpan) totalQSpan.textContent = '9';
		}

		updateProgress();
	});
});

// Progress bar update
function updateProgress() {
	const progress = (currentSection / totalSections) * 100;
	progressBar.style.width = progress + '%';
	progressPercent.textContent = Math.round(progress) + '%';
	currentQSpan.textContent = currentSection;
}

// Show specific section
function showSection(sectionNumber) {
	sections.forEach(section => {
		section.classList.remove('active');
	});

	const targetSection = document.querySelector(`[data-section="${sectionNumber}"]`);
	if (targetSection) {
		targetSection.classList.add('active');
	}

	btnPrevious.style.display = sectionNumber === 1 ? 'none' : 'block';
	btnNext.style.display = sectionNumber === totalSections ? 'none' : 'block';
	btnSubmit.style.display = sectionNumber === totalSections ? 'block' : 'none';

	updateProgress();
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate current section
function validateSection(sectionNumber) {
	const section = document.querySelector(`[data-section="${sectionNumber}"]`);
	const requiredFields = section.querySelectorAll('[required]');
	let isValid = true;

	requiredFields.forEach(field => {
		const formGroup = field.closest('.form-group');
		const errorMsg = formGroup ? formGroup.querySelector('.error') : null;

		if (field.type === 'radio') {
			const radioGroup = formGroup.querySelectorAll(`input[name="${field.name}"]`);
			const isChecked = Array.from(radioGroup).some(radio => radio.checked);

			if (!isChecked) {
				isValid = false;
				if (errorMsg) errorMsg.style.display = 'block';
			} else {
				if (errorMsg) errorMsg.style.display = 'none';
			}
		} else if (field.value.trim() === '') {
			isValid = false;
			if (errorMsg) errorMsg.style.display = 'block';
		} else {
			if (errorMsg) errorMsg.style.display = 'none';
		}
	});

	// Special validation for Section 2 - at least one shopping location
	if (sectionNumber === 2) {
		const lieuxChecked = section.querySelectorAll('input[name="lieu_courses"]:checked');
		if (lieuxChecked.length === 0) {
			isValid = false;
			alert('Veuillez sélectionner au moins un lieu de courses');
		}
	}

	// Special validation for diaspora sections
	if (sectionNumber === 8) {
		// Section 8 always requires the diaspora question
		const diasporaAnswer = document.querySelector('input[name="est_diaspora"]:checked');
		if (!diasporaAnswer) {
			isValid = false;
			alert('Veuillez indiquer si vous êtes membre de la diaspora');
		}
	}

	if (sectionNumber === 9 && isDiaspora) {
		// Only validate diaspora fields if user is diaspora
		const diasporaFields = section.querySelectorAll('.diaspora-only [required]');
		diasporaFields.forEach(field => {
			if (!field.value || field.value.trim() === '') {
				isValid = false;
			}
		});
	}

	return isValid;
}

// Next button handler
btnNext.addEventListener('click', function () {
	if (validateSection(currentSection)) {
		currentSection++;
		showSection(currentSection);
	} else {
		alert('Veuillez remplir tous les champs requis');
	}
});

// Previous button handler
btnPrevious.addEventListener('click', function () {
	currentSection--;
	showSection(currentSection);
});

// Form submission handler
form.addEventListener('submit', async function (e) {
	e.preventDefault();

	if (!validateSection(currentSection)) {
		alert('Veuillez remplir tous les champs requis');
		return;
	}

	// Disable submit button
	btnSubmit.disabled = true;
	btnSubmit.textContent = 'Envoi en cours...';

	// Show loading state
	loading.style.display = 'block';
	errorMessage.style.display = 'none';

	// Collect form data
	const formData = new FormData(form);
	const data = {};

	// Process form data - handle multiple values for checkboxes
	for (let [key, value] of formData.entries()) {
		if (data[key]) {
			if (Array.isArray(data[key])) {
				data[key].push(value);
			} else {
				data[key] = [data[key], value];
			}
		} else {
			data[key] = value;
		}
	}

	// Add metadata
	data.timestamp = new Date().toISOString();

	// Format arrays as strings for Airtable
	[
		'lieu_courses',
		'defis',
		'plats',
		'avantages_anticipe',
		'attrait',
		'inquietudes',
		'methode_aide_actuelle',
		'fonctionnalites_diaspora',
	].forEach(field => {
		if (data[field] && Array.isArray(data[field])) {
			data[field] = data[field].join(', ');
		} else if (data[field] && !Array.isArray(data[field])) {
			// Single value, keep as is
		} else {
			data[field] = '';
		}
	});

	// Convert checkbox values to boolean
	data.beta_tester = data.beta_tester === 'oui';

	try {
		// First try Netlify function, fallback to direct Google Sheets
		let result;
		
		try {
			// Try Netlify function first
			const response = await fetch('/.netlify/functions/submit-survey', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});
			result = await response.json();
		} catch (netlifyError) {
			// Fallback to direct Google Sheets submission
			console.log('Falling back to direct Google Sheets submission');
			
			const gsResponse = await fetch(GOOGLE_SCRIPT_URL, {
				method: 'POST',
				mode: 'no-cors',
				headers: {
					'Content-Type': 'text/plain',
				},
				body: JSON.stringify(data),
			});
			
			// With no-cors, we can't read the response, so assume success
			result = {
				success: true,
				message: 'Réponse enregistrée',
				promoCode: 'LEEKET' + Math.random().toString(36).substr(2, 6).toUpperCase()
			};
		}

		// Check if it's a duplicate submission
		if (result.isDuplicate) {
			// Hide loading
			loading.style.display = 'none';
			
			// Show duplicate message
			errorMessage.style.display = 'block';
			errorMessage.innerHTML = `
				<div style="background: #FFF3CD; border: 1px solid #FFC107; color: #856404; padding: 15px; border-radius: 8px;">
					<strong>⚠️ Participation déjà enregistrée</strong><br>
					${result.message}<br><br>
					Votre code promo: <strong style="font-size: 18px;">${result.promoCode}</strong><br>
					<small>Utilisez ce code lors de votre première commande</small>
				</div>
			`;
			
			// Re-enable submit button with different text
			btnSubmit.disabled = false;
			btnSubmit.textContent = 'Déjà participé ✓';
			
			// Save promo code anyway
			if (result.promoCode) {
				localStorage.setItem('leeket_promo', result.promoCode);
			}
			
			return; // Stop here for duplicates
		}

		// Success - show success message
		form.style.display = 'none';
		document.querySelector('.progress-container').style.display = 'none';
		loading.style.display = 'none';
		successMessage.style.display = 'block';

		// Log success for debugging
		console.log('Survey submitted successfully:', result);

		// Save to localStorage for future reference
		if (result.promoCode) {
			localStorage.setItem('leeket_promo', result.promoCode);
		}
		
		// Clear draft after successful submission
		clearDraft();
	} catch (error) {
		// Network or other error
		console.error('Submission error:', error);

		// Show error message
		loading.style.display = 'none';
		errorMessage.style.display = 'block';
		errorMessage.textContent = `Erreur: ${error.message}. Veuillez réessayer ou nous contacter directement.`;

		// Re-enable submit button
		btnSubmit.disabled = false;
		btnSubmit.textContent = 'Envoyer mes réponses 🎉';

		// Fallback: save data locally
		localStorage.setItem('leeket_survey_backup', JSON.stringify(data));
		console.log('Data saved locally as backup');
	}
});

// Auto-save draft functionality
let autoSaveTimer;
function autoSaveDraft() {
	clearTimeout(autoSaveTimer);
	autoSaveTimer = setTimeout(() => {
		const formData = new FormData(form);
		const draft = {};

		for (let [key, value] of formData.entries()) {
			if (draft[key]) {
				if (Array.isArray(draft[key])) {
					draft[key].push(value);
				} else {
					draft[key] = [draft[key], value];
				}
			} else {
				draft[key] = value;
			}
		}

		localStorage.setItem('leeket_survey_draft', JSON.stringify(draft));
		console.log('Draft saved');
	}, 2000);
}

// Add auto-save listeners
form.addEventListener('input', autoSaveDraft);
form.addEventListener('change', autoSaveDraft);

// Load draft on page load
window.addEventListener('DOMContentLoaded', () => {
	const draft = localStorage.getItem('leeket_survey_draft');
	if (draft) {
		try {
			const draftData = JSON.parse(draft);
			console.log('Draft found, loading...');

			// Restore form values
			Object.keys(draftData).forEach(key => {
				const value = draftData[key];
				const elements = form.elements[key];

				if (elements) {
					if (elements.length) {
						// Radio buttons or checkboxes
						if (Array.isArray(value)) {
							value.forEach(val => {
								const elem = Array.from(elements).find(e => e.value === val);
								if (elem) elem.checked = true;
							});
						} else {
							const elem = Array.from(elements).find(e => e.value === value);
							if (elem) elem.checked = true;
						}
					} else {
						// Single input
						elements.value = value;
					}
				}
			});

			// Update visual state for checkboxes and radios
			document.querySelectorAll('.radio-item input:checked, .checkbox-item input:checked').forEach(input => {
				input.closest('.radio-item, .checkbox-item')?.classList.add('selected');
			});

			document.querySelectorAll('.dish-item input:checked').forEach(input => {
				input.closest('.dish-item')?.classList.add('selected');
			});
		} catch (error) {
			console.error('Error loading draft:', error);
		}
	}

	// Initialize progress
	updateProgress();
	
	// Set total questions to 9 from the start
	const totalQSpan = document.getElementById('totalQ');
	if (totalQSpan) totalQSpan.textContent = '9';
});

// Clear draft on successful submission
function clearDraft() {
	localStorage.removeItem('leeket_survey_draft');
}
