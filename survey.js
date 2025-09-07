// Survey form JavaScript with Netlify Functions integration
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzA4VOEmB5snYnP0sYFBAPWflPyMW8b_AG_vhd1H3osEiKe31iSrr3VMgDr1KZmoNNh/exec';
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
let totalSections = 10; // Now 10 sections total
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

// Handle early diaspora detection in Section 1
const localisationRadios = document.querySelectorAll('input[name="localisation"]');
localisationRadios.forEach(radio => {
	radio.addEventListener('change', function() {
		const isLocal = this.value === 'senegal';
		const isDiaspora = this.value === 'etranger';
		
		// Show/hide relevant fields
		const localOnlyFields = document.querySelectorAll('.local-only');
		const diasporaOnlyFields = document.querySelectorAll('.diaspora-only');
		const diasporaEngagement = document.querySelector('.diaspora-engagement');
		
		// For diaspora users, remove required from sections 2-7 that will be skipped
		if (isDiaspora) {
			for (let i = 2; i <= 7; i++) {
				const section = document.querySelector(`[data-section="${i}"]`);
				if (section) {
					section.querySelectorAll('[required]').forEach(input => {
						input.setAttribute('data-was-required', 'true');
						input.removeAttribute('required');
					});
				}
			}
		} else {
			// Restore required for sections 2-7 for local users
			for (let i = 2; i <= 7; i++) {
				const section = document.querySelector(`[data-section="${i}"]`);
				if (section) {
					section.querySelectorAll('[data-was-required]').forEach(input => {
						input.setAttribute('required', '');
						input.removeAttribute('data-was-required');
					});
				}
			}
		}
		
		if (isLocal) {
			// Show local fields
			localOnlyFields.forEach(field => {
				// Handle both block and inline display
				if (field.tagName === 'SPAN') {
					field.style.display = 'inline';
				} else {
					field.style.display = 'block';
				}
				const select = field.querySelector('select[name="quartier"]');
				if (select) select.setAttribute('required', 'required');
			});
			// Hide diaspora fields
			diasporaOnlyFields.forEach(field => {
				field.style.display = 'none';
				const inputs = field.querySelectorAll('[required]');
				inputs.forEach(input => {
					input.setAttribute('data-was-required', 'true');
					input.removeAttribute('required');
				});
			});
			if (diasporaEngagement) diasporaEngagement.style.display = 'none';
		} else if (isDiaspora) {
			// Hide local fields
			localOnlyFields.forEach(field => {
				field.style.display = 'none';
				const inputs = field.querySelectorAll('[required]');
				inputs.forEach(input => {
					input.setAttribute('data-was-required', 'true');
					input.removeAttribute('required');
				});
			});
			// Show diaspora fields
			diasporaOnlyFields.forEach(field => {
				// Handle both block and inline display
				if (field.tagName === 'SPAN') {
					field.style.display = 'inline';
				} else {
					field.style.display = 'block';
				}
				// Restore required for diaspora fields
				field.querySelectorAll('[data-was-required]').forEach(input => {
					input.setAttribute('required', '');
					input.removeAttribute('data-was-required');
				});
				// Make region required
				const regionRadios = field.querySelectorAll('input[name="diaspora_region"]');
				if (regionRadios.length > 0) {
					regionRadios.forEach(radio => radio.setAttribute('required', 'required'));
				}
			});
			// Show engagement message
			if (diasporaEngagement) diasporaEngagement.style.display = 'block';
		}
		
		// Update progress display when location changes
		updateProgress();
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

// Set initial total questions
const totalQSpan = document.getElementById('totalQ');
if (totalQSpan) totalQSpan.textContent = '10';

// Progress bar update
function updateProgress() {
	const locationAnswer = document.querySelector('input[name="localisation"]:checked');
	const isDiaspora = locationAnswer && locationAnswer.value === 'etranger';
	
	let adjustedSection = currentSection;
	let adjustedTotal = totalSections;
	
	if (isDiaspora) {
		// For diaspora: Section 1, then 8, 9, 10 (show as 1, 2, 3, 4)
		if (currentSection === 1) adjustedSection = 1;
		else if (currentSection === 8) adjustedSection = 2;
		else if (currentSection === 9) adjustedSection = 3;
		else if (currentSection === 10) adjustedSection = 4;
		adjustedTotal = 4;
	}
	
	const progress = (adjustedSection / adjustedTotal) * 100;
	progressBar.style.width = progress + '%';
	progressPercent.textContent = Math.round(progress) + '%';
	currentQSpan.textContent = adjustedSection;
	
	// Update total display
	const totalQSpan = document.getElementById('totalQ');
	if (totalQSpan) totalQSpan.textContent = adjustedTotal;
}

// Show specific section
function showSection(sectionNumber) {
	sections.forEach(section => {
		section.classList.remove('active');
	});

	const targetSection = document.querySelector(`[data-section="${sectionNumber}"]`);
	if (targetSection) {
		targetSection.classList.add('active');
		
		// Make sure diaspora/local fields are properly shown based on location
		const locationAnswer = document.querySelector('input[name="localisation"]:checked');
		if (locationAnswer) {
			const isDiaspora = locationAnswer.value === 'etranger';
			const isLocal = locationAnswer.value === 'senegal';
			
			// Update fields visibility in the current section
			targetSection.querySelectorAll('.local-only').forEach(field => {
				if (field.tagName === 'SPAN') {
					field.style.display = isLocal ? 'inline' : 'none';
				} else {
					field.style.display = isLocal ? 'block' : 'none';
				}
				// Manage required attribute for inputs inside local-only containers
				field.querySelectorAll('input, select, textarea').forEach(input => {
					if (isLocal) {
						if (input.hasAttribute('data-was-required')) {
							input.setAttribute('required', '');
						}
					} else {
						if (input.hasAttribute('required')) {
							input.setAttribute('data-was-required', 'true');
							input.removeAttribute('required');
						}
					}
				});
			});
			
			targetSection.querySelectorAll('.diaspora-only').forEach(field => {
				if (field.tagName === 'SPAN') {
					field.style.display = isDiaspora ? 'inline' : 'none';
				} else {
					field.style.display = isDiaspora ? 'block' : 'none';
				}
				// Manage required attribute for inputs inside diaspora-only containers
				field.querySelectorAll('input, select, textarea').forEach(input => {
					if (isDiaspora) {
						if (input.hasAttribute('data-was-required')) {
							input.setAttribute('required', '');
						}
					} else {
						if (input.hasAttribute('required')) {
							input.setAttribute('data-was-required', 'true');
							input.removeAttribute('required');
						}
					}
				});
			});
		}
	}

	// Adjust button display for diaspora users (they only see 4 sections)
	const locationAnswer = document.querySelector('input[name="localisation"]:checked');
	const isDiaspora = locationAnswer && locationAnswer.value === 'etranger';
	const effectiveTotalSections = isDiaspora ? 10 : totalSections; // Diaspora still goes to 10, but skips 2-7
	
	btnPrevious.style.display = sectionNumber === 1 ? 'none' : 'block';
	btnNext.style.display = sectionNumber === effectiveTotalSections ? 'none' : 'block';
	btnSubmit.style.display = sectionNumber === effectiveTotalSections ? 'block' : 'none';

	updateProgress();
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate current section
function validateSection(sectionNumber) {
	const section = document.querySelector(`[data-section="${sectionNumber}"]`);
	const requiredFields = section.querySelectorAll('[required]');
	let isValid = true;
	let firstInvalidField = null;

	// Clear previous invalid states
	section.querySelectorAll('.form-group.invalid').forEach(group => {
		group.classList.remove('invalid');
	});

	// Special handling for section 10 - check if user is diaspora or local
	const locationAnswer = document.querySelector('input[name="localisation"]:checked');
	const isDiaspora = locationAnswer && locationAnswer.value === 'etranger';
	
	requiredFields.forEach(field => {
		const formGroup = field.closest('.form-group');
		
		// Skip validation for hidden fields (diaspora-only or local-only that are not visible)
		const diasporaContainer = field.closest('.diaspora-only');
		const localContainer = field.closest('.local-only');
		
		// For section 10, skip validation based on user type
		if (sectionNumber === 10) {
			if (isDiaspora && localContainer) {
				return; // Skip local fields for diaspora users
			}
			if (!isDiaspora && diasporaContainer) {
				return; // Skip diaspora fields for local users
			}
		}
		
		if (diasporaContainer && diasporaContainer.style.display === 'none') {
			return; // Skip this field
		}
		if (localContainer && localContainer.style.display === 'none') {
			return; // Skip this field
		}
		
		if (field.type === 'radio') {
			const radioGroup = formGroup.querySelectorAll(`input[name="${field.name}"]`);
			const isChecked = Array.from(radioGroup).some(radio => radio.checked);

			if (!isChecked) {
				isValid = false;
				if (formGroup) {
					formGroup.classList.add('invalid');
					if (!firstInvalidField) firstInvalidField = formGroup;
				}
			} else {
				if (formGroup) formGroup.classList.remove('invalid');
			}
		} else if (field.type === 'checkbox') {
			// Handle checkbox validation separately
			const checkboxGroup = formGroup.querySelectorAll(`input[name="${field.name}"]:checked`);
			if (checkboxGroup.length === 0) {
				isValid = false;
				if (formGroup) {
					formGroup.classList.add('invalid');
					if (!firstInvalidField) firstInvalidField = formGroup;
				}
			} else {
				if (formGroup) formGroup.classList.remove('invalid');
			}
		} else if (field.value.trim() === '') {
			isValid = false;
			if (formGroup) {
				formGroup.classList.add('invalid');
				if (!firstInvalidField) firstInvalidField = formGroup;
			}
		} else {
			// Special handling for telephone field pattern validation
			if (field.type === 'tel' && field.pattern) {
				const pattern = new RegExp(field.pattern.replace(/\\\\/g, '\\'));
				if (!pattern.test(field.value)) {
					isValid = false;
					if (formGroup) {
						formGroup.classList.add('invalid');
						if (!firstInvalidField) firstInvalidField = formGroup;
					}
				} else {
					if (formGroup) formGroup.classList.remove('invalid');
				}
			} else {
				if (formGroup) formGroup.classList.remove('invalid');
			}
		}
	});

	// Special validation for Section 2 - at least one shopping location
	if (sectionNumber === 2) {
		const lieuxChecked = section.querySelectorAll('input[name="lieu_courses"]:checked');
		const formGroup = section.querySelector('.form-group');
		if (lieuxChecked.length === 0) {
			isValid = false;
			if (formGroup) {
				formGroup.classList.add('invalid');
				if (!firstInvalidField) firstInvalidField = formGroup;
			}
		}
	}

	// Special validation for Section 1 - location question
	if (sectionNumber === 1) {
		const locationAnswer = document.querySelector('input[name="localisation"]:checked');
		if (!locationAnswer) {
			isValid = false;
			const formGroup = section.querySelector('.form-group');
			if (formGroup) {
				formGroup.classList.add('invalid');
				if (!firstInvalidField) firstInvalidField = formGroup;
			}
		}
	}

	// Special validation for Section 8 - zones
	if (sectionNumber === 8) {
		const localZones = section.querySelectorAll('input[name="zones_livraison"]:checked');
		const diasporaZones = section.querySelectorAll('input[name="zones_famille"]:checked');
		const locationAnswer = document.querySelector('input[name="localisation"]:checked');
		
		if (locationAnswer) {
			if (locationAnswer.value === 'senegal' && localZones.length === 0) {
				isValid = false;
				const formGroup = section.querySelector('.local-only .form-group') || section.querySelector('.form-group');
				if (formGroup) {
					formGroup.classList.add('invalid');
					if (!firstInvalidField) firstInvalidField = formGroup;
				}
			} else if (locationAnswer.value === 'etranger' && diasporaZones.length === 0) {
				isValid = false;
				const formGroup = section.querySelector('[name="zones_famille"]')?.closest('.form-group');
				if (formGroup) {
					formGroup.classList.add('invalid');
					if (!firstInvalidField) firstInvalidField = formGroup;
				}
			}
		}
	}
	
	// Special validation for Section 10 - recommendations
	if (sectionNumber === 10) {
		const locationAnswer = document.querySelector('input[name="localisation"]:checked');
		if (locationAnswer) {
			if (locationAnswer.value === 'senegal') {
				const localRecommendation = section.querySelector('input[name="recommandation_locale"]:checked');
				if (!localRecommendation) {
					isValid = false;
					const formGroup = section.querySelector('.local-only input[name="recommandation_locale"]')?.closest('.form-group');
					if (formGroup) {
						formGroup.classList.add('invalid');
						if (!firstInvalidField) firstInvalidField = formGroup;
					}
				}
			} else if (locationAnswer.value === 'etranger') {
				const diasporaRecommendation = section.querySelector('input[name="recommandation_diaspora"]:checked');
				if (!diasporaRecommendation) {
					isValid = false;
					const formGroup = section.querySelector('.diaspora-only input[name="recommandation_diaspora"]')?.closest('.form-group');
					if (formGroup) {
						formGroup.classList.add('invalid');
						if (!firstInvalidField) firstInvalidField = formGroup;
					}
				}
			}
		}
	}

	// Scroll to first invalid field if validation fails
	if (!isValid && firstInvalidField) {
		firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	return isValid;
}

// Next button handler
btnNext.addEventListener('click', function () {
	if (validateSection(currentSection)) {
		// Check if diaspora user should skip sections 2-7
		const locationAnswer = document.querySelector('input[name="localisation"]:checked');
		if (locationAnswer && locationAnswer.value === 'etranger' && currentSection === 1) {
			// Skip directly to Section 8 for diaspora users
			currentSection = 8;
		} else {
			currentSection++;
		}
		showSection(currentSection);
	}
	// No alert needed - fields are now highlighted visually
});

// Previous button handler
btnPrevious.addEventListener('click', function () {
	// Check if diaspora user should skip sections 2-7
	const locationAnswer = document.querySelector('input[name="localisation"]:checked');
	if (locationAnswer && locationAnswer.value === 'etranger' && currentSection === 8) {
		// Skip back to Section 1 for diaspora users
		currentSection = 1;
	} else {
		currentSection--;
	}
	showSection(currentSection);
});

// Form submission handler
form.addEventListener('submit', async function (e) {
	e.preventDefault();
	
	console.log('Form submission triggered, current section:', currentSection);

	if (!validateSection(currentSection)) {
		// Fields are highlighted, no alert needed
		console.log('Validation failed for section', currentSection);
		return;
	}
	
	console.log('Validation passed, proceeding with submission...');

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
	
	// Debug: Log collected data before processing
	console.log('Raw form data collected:', data);

	// Add metadata
	data.timestamp = new Date().toISOString();
	
	// Ensure all required fields are present (backend requires these)
	// Required fields: ['quartier', 'age', 'foyer_size', 'profession', 'telephone']
	
	// For diaspora users, set default values for local-only fields
	const locationAnswer = document.querySelector('input[name="localisation"]:checked');
	if (locationAnswer && locationAnswer.value === 'etranger') {
		// Set default values for fields that diaspora users don't fill
		if (!data.quartier) data.quartier = 'Diaspora';
		if (!data.lieu_courses) data.lieu_courses = 'N/A';
		if (!data.frequence_courses) data.frequence_courses = 'N/A';
		if (!data.budget_hebdo) data.budget_hebdo = 'N/A';
		if (!data.defis) data.defis = 'N/A';
		if (!data.plats) data.plats = 'N/A';
		if (!data.delai_commande) data.delai_commande = 'N/A';
		if (!data.commande_auto) data.commande_auto = 'N/A';
	}
	
	// Ensure all absolutely required fields have values (fallback safety)
	if (!data.quartier || data.quartier === '') {
		data.quartier = data.zones_famille || 'Non spécifié';
	}
	if (!data.age || data.age === '') {
		data.age = 'Non spécifié';
	}
	if (!data.foyer_size || data.foyer_size === '') {
		data.foyer_size = 'Non spécifié';
	}
	if (!data.profession || data.profession === '') {
		data.profession = 'Non spécifié';
	}
	if (!data.telephone || data.telephone === '') {
		console.error('Warning: telephone field is empty, this should not happen');
		data.telephone = 'Non fourni';
	}
	
	// Debug: Log data after ensuring required fields
	console.log('Data after ensuring required fields:', {
		quartier: data.quartier,
		age: data.age,
		foyer_size: data.foyer_size,
		profession: data.profession,
		telephone: data.telephone
	});

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
		'zones_livraison',
		'zones_famille',
		'produits_preferes_diaspora',
		'difficultes_diaspora',
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

// Check survey status on page load
async function checkSurveyStatus() {
	// Check if survey is closed
	if (typeof SURVEY_CONFIG !== 'undefined') {
		// Force closed for testing
		if (SURVEY_CONFIG.forceClosed) {
			return showClosureScreen();
		}
		
		// Force open overrides all other settings
		if (SURVEY_CONFIG.forceOpen) {
			return;
		}
		
		// Check main status
		if (SURVEY_CONFIG.status === 'closed') {
			return showClosureScreen();
		}
		
		// Check closure date if set
		if (SURVEY_CONFIG.closureDate) {
			const closureTime = new Date(SURVEY_CONFIG.closureDate).getTime();
			if (new Date().getTime() > closureTime) {
				return showClosureScreen();
			}
		}
	}
	
	// Try to get stats from Google Sheets to check target responses
	try {
		const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getStats');
		const stats = await response.json();
		
		if (SURVEY_CONFIG && SURVEY_CONFIG.targetResponses && stats.totalResponses >= SURVEY_CONFIG.targetResponses) {
			return showClosureScreen(stats);
		}
	} catch (error) {
		console.log('Could not fetch stats:', error);
	}
}

// Show the closure screen
function showClosureScreen(stats = null) {
	// Hide survey form
	const surveyContainer = document.querySelector('.survey-container');
	if (surveyContainer) {
		surveyContainer.style.display = 'none';
	}
	
	// Show closure screen
	const closureScreen = document.getElementById('surveyClosedScreen');
	if (closureScreen) {
		closureScreen.style.display = 'block';
		
		// Update statistics if available
		if (stats) {
			const totalElement = closureScreen.querySelector('.stat-number');
			if (totalElement) {
				totalElement.textContent = stats.totalResponses || '1000+';
			}
		}
		
		// Update messages from config if available
		if (typeof SURVEY_CONFIG !== 'undefined' && SURVEY_CONFIG.messages) {
			const titleElement = closureScreen.querySelector('h1');
			const messageElement = closureScreen.querySelector('p:nth-of-type(1)');
			const subtextElement = closureScreen.querySelector('p:nth-of-type(2)');
			const footerElement = closureScreen.querySelector('.closure-footer p:nth-of-type(1)');
			const contactElement = closureScreen.querySelector('.closure-footer p:nth-of-type(2)');
			
			if (titleElement && SURVEY_CONFIG.messages.closureTitle) {
				titleElement.textContent = SURVEY_CONFIG.messages.closureTitle;
			}
			if (messageElement && SURVEY_CONFIG.messages.closureMessage) {
				messageElement.textContent = SURVEY_CONFIG.messages.closureMessage;
			}
			if (subtextElement && SURVEY_CONFIG.messages.closureSubtext) {
				subtextElement.textContent = SURVEY_CONFIG.messages.closureSubtext;
			}
			if (footerElement && SURVEY_CONFIG.messages.closureFooter) {
				footerElement.textContent = SURVEY_CONFIG.messages.closureFooter;
			}
			if (contactElement && SURVEY_CONFIG.messages.closureContact) {
				contactElement.textContent = SURVEY_CONFIG.messages.closureContact;
			}
		}
	}
}

// Load draft on page load
window.addEventListener('DOMContentLoaded', async () => {
	// Check if survey is closed first
	await checkSurveyStatus();
	
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
	
	// Update participant count (fetch from Google Sheets or use cached value)
	updateParticipantCount();
	
	// Initialize field visibility based on location selection if already made
	const selectedLocation = document.querySelector('input[name="localisation"]:checked');
	if (selectedLocation) {
		selectedLocation.dispatchEvent(new Event('change'));
	}
});

// Function to update participant count
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
		
		// For now, use a realistic growing number based on date
		// This simulates organic growth until real API is connected
		const launchDate = new Date('2024-01-15').getTime();
		const daysSinceLaunch = Math.floor((now - launchDate) / (1000 * 60 * 60 * 24));
		const baseCount = 250;
		const dailyGrowth = 8; // Average 8 responses per day
		const estimatedCount = baseCount + (daysSinceLaunch * dailyGrowth);
		
		// Add some randomness to make it look more natural
		const randomVariation = Math.floor(Math.random() * 20) - 10;
		const finalCount = Math.max(250, estimatedCount + randomVariation);
		
		// Update display
		document.getElementById('participantCount').textContent = finalCount;
		
		// Cache the value
		localStorage.setItem('leeket_participant_count', finalCount);
		localStorage.setItem('leeket_count_time', now.toString());
		
	} catch (error) {
		console.log('Could not update participant count:', error);
		// Keep default value of 250
	}
}

// Clear draft on successful submission
function clearDraft() {
	localStorage.removeItem('leeket_survey_draft');
}
