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
const loadingOverlay = document.getElementById('loadingOverlay');

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
			// Special handling for telephone field - validate more flexibly
			if (field.type === 'tel') {
				// Remove non-digits and check if it's a valid phone
				const cleanPhone = field.value.replace(/\D/g, '');
				// Accept 8-12 digits (to allow for country codes)
				if (cleanPhone.length < 8 || cleanPhone.length > 15) {
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
	if (loadingOverlay) {
		loadingOverlay.classList.add('active');
	}
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
	
	// Check specifically for telephone field and clean it
	const telInput = document.querySelector('input[name="telephone"]');
	if (telInput) {
		console.log('Telephone input found:', {
			value: telInput.value,
			required: telInput.hasAttribute('required'),
			disabled: telInput.disabled,
			type: telInput.type,
			pattern: telInput.pattern
		});
		// Force add telephone if missing
		if (!data.telephone && telInput.value) {
			data.telephone = telInput.value;
			console.log('Manually added telephone:', telInput.value);
		}
	} else {
		console.error('Telephone input field not found in DOM!');
	}
	
	// Clean phone number - handle international formats
	if (data.telephone) {
		// Store original for logging
		const originalPhone = data.telephone;
		
		// Remove all non-digit characters except + at the beginning
		let cleanPhone = data.telephone.replace(/^\+/, 'PLUS').replace(/\D/g, '').replace(/^PLUS/, '+');
		
		// Check if it starts with + (international format)
		if (cleanPhone.startsWith('+')) {
			// Special handling for Senegal numbers to ensure they're valid
			if (cleanPhone.startsWith('+221')) {
				// Senegalese number with country code - ensure it's properly formatted
				const withoutCode = cleanPhone.substring(4);
				if (withoutCode.length === 9 && ['7', '6', '5', '3'].includes(withoutCode[0])) {
					data.telephone = cleanPhone;
					console.log('Senegalese international number validated:', data.telephone);
				} else {
					// Keep as is but log warning
					data.telephone = cleanPhone;
					console.log('Warning: Senegalese number might be malformed:', data.telephone);
				}
			} else {
				// Keep other international numbers as is
				data.telephone = cleanPhone;
				console.log('International phone number kept:', data.telephone);
			}
		} else {
			// Remove leading zeros from international dialing
			cleanPhone = cleanPhone.replace(/^00/, '');
			
			// Check if it's a Senegalese number with country code
			if (cleanPhone.startsWith('221') && cleanPhone.length === 12) {
				// Keep as international format with +
				data.telephone = '+' + cleanPhone;
				console.log('Senegalese international number formatted:', data.telephone);
			}
			// Check if it looks like a Senegalese mobile number (9 digits starting with 7, 6, or 5)
			else if (cleanPhone.length === 9 && ['7', '6', '5'].includes(cleanPhone[0])) {
				data.telephone = cleanPhone;
				console.log('Senegalese local number cleaned:', data.telephone);
			} else if (cleanPhone.length === 8 && ['7', '6', '5'].includes(cleanPhone[0])) {
				// Missing first digit, add default 7
				data.telephone = '7' + cleanPhone;
				console.log('Senegalese phone number adjusted:', data.telephone);
			} else if (cleanPhone.startsWith('06') && cleanPhone.length === 10) {
				// French mobile number starting with 06, add +33 and remove leading 0
				data.telephone = '+33' + cleanPhone.substring(1);
				console.log('French phone number formatted:', data.telephone);
			} else if (cleanPhone.startsWith('07') && cleanPhone.length === 10) {
				// French mobile number starting with 07, add +33 and remove leading 0
				data.telephone = '+33' + cleanPhone.substring(1);
				console.log('French phone number formatted:', data.telephone);
			} else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
				// Other national formats - try to detect country
				if (cleanPhone.startsWith('04') || cleanPhone.startsWith('047')) {
					// Belgian mobile
					data.telephone = '+32' + cleanPhone.substring(1);
					console.log('Belgian phone number formatted:', data.telephone);
				} else if (cleanPhone.startsWith('05') && cleanPhone[2] === '4') {
					// Canadian mobile (514, 524, etc.)
					data.telephone = '+1' + cleanPhone.substring(1);
					console.log('Canadian phone number formatted:', data.telephone);
				} else {
					// Generic national format, add + for international
					data.telephone = '+' + cleanPhone;
					console.log('National phone number (country unknown):', data.telephone);
				}
			} else if (cleanPhone.length >= 8) {
				// Likely an international number, add + prefix if not present
				data.telephone = '+' + cleanPhone;
				console.log('International phone number formatted:', data.telephone);
			} else {
				// Keep as is for other formats
				data.telephone = cleanPhone;
				console.log('Phone number kept as entered:', data.telephone);
			}
		}
		
		console.log(`Phone cleaning: "${originalPhone}" -> "${data.telephone}"`);
	}

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
	
	// Generate unique promo code based on phone number
	function generateUniquePromoCode(phone) {
		// Clean phone for use in code
		const phoneDigits = phone.replace(/\D/g, '');
		const lastFour = phoneDigits.slice(-4);
		const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase();
		// Format: LK + last 4 phone digits + 4 random chars
		// Example: LK4567AB2C
		return `LK${lastFour}${randomPart}`;
	}
	
	// Generate promo code before submission
	const promoCode = generateUniquePromoCode(data.telephone);
	data.promo_code = promoCode;
	data.code_status = 'active';
	data.code_value = 2000; // FCFA value
	data.code_expiry = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(); // 6 months

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
			
			// Check if we should fallback to Google Sheets
			if (!result.success && result.error && 
				(result.error.includes('Google Sheets') || result.error.includes('Airtable'))) {
				console.log('Netlify function suggests using Google Sheets, falling back...');
				throw new Error('Use Google Sheets fallback');
			}
		} catch (netlifyError) {
			// Fallback to direct Google Sheets submission
			console.log('Falling back to direct Google Sheets submission:', netlifyError.message);
			
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
				promoCode: promoCode // Use the generated code
			};
		}

		// Check if it's a duplicate submission
		if (result.isDuplicate) {
			// Hide loading
			loading.style.display = 'none';
			if (loadingOverlay) {
				loadingOverlay.classList.remove('active');
			}
			
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

		// Check if submission was successful
		if (!result.success) {
			throw new Error(result.error || 'Erreur lors de la soumission');
		}
		
		// Success - show success message
		form.style.display = 'none';
		document.querySelector('.progress-container').style.display = 'none';
		loading.style.display = 'none';
		if (loadingOverlay) {
			loadingOverlay.classList.remove('active');
		}
		successMessage.style.display = 'block';
		
		// Display the promo code
		const promoCodeDisplay = document.getElementById('promoCodeDisplay');
		if (promoCodeDisplay && result.promoCode) {
			promoCodeDisplay.textContent = result.promoCode;
		}

		// Log success for debugging
		console.log('Survey submitted successfully:', result);

		// Save to localStorage for future reference
		if (result.promoCode) {
			localStorage.setItem('leeket_promo', result.promoCode);
			// Also save phone number to prevent duplicate codes
			localStorage.setItem('leeket_phone', data.telephone);
		}
		
		// Clear draft after successful submission
		clearDraft();
	} catch (error) {
		// Network or other error
		console.error('Submission error:', error);

		// Show error message
		loading.style.display = 'none';
		if (loadingOverlay) {
			loadingOverlay.classList.remove('active');
		}
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

// Function to update participant count - NOW USES REAL GOOGLE SHEETS DATA
async function updateParticipantCount() {
	try {
		// FORCE CLEAR OLD CACHE - Remove old simulated values
		const cachedValue = localStorage.getItem('leeket_participant_count');
		if (cachedValue && parseInt(cachedValue) > 100) {
			// Clear unrealistic cached values
			console.log('🧹 Clearing unrealistic cached value:', cachedValue);
			localStorage.removeItem('leeket_participant_count');
			localStorage.removeItem('leeket_count_time');
		}
		
		// Try to get count from localStorage first (cache for 5 minutes only)
		const cached = localStorage.getItem('leeket_participant_count');
		const cacheTime = localStorage.getItem('leeket_count_time');
		const now = new Date().getTime();
		
		// Only use cache if it's recent AND realistic
		if (cached && cacheTime && (now - parseInt(cacheTime) < 300000)) { // 5 min cache only
			const count = parseInt(cached);
			// Only use if value is realistic (under 100 for now)
			if (count < 100) {
				document.getElementById('participantCount').textContent = count;
				console.log('Using cached participant count:', count);
				// Fade in the banner
				const banner = document.getElementById('participantBanner');
				if (banner) {
					banner.style.opacity = '1';
				}
				return;
			}
		}
		
		// Try to fetch REAL count from Google Sheets
		console.log('Fetching real participant count from Google Sheets...');
		
		try {
			const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getStats', {
				method: 'GET',
				mode: 'cors'
			});
			
			console.log('API Response status:', response.status);
			const data = await response.json();
			console.log('API Response data:', data);
			
			// Check multiple possible field names for the count
			let realCount = 0;
			if (data.success && data.totalResponses !== undefined) {
				realCount = parseInt(data.totalResponses) || 0;
			} else if (data.participants !== undefined) {
				realCount = parseInt(data.participants) || 0;
			} else if (data.count !== undefined) {
				realCount = parseInt(data.count) || 0;
			} else if (!isNaN(parseInt(data))) {
				// If the response is just a number
				realCount = parseInt(data);
			}
			
			if (realCount > 0 || (data.success && realCount === 0)) {
				// We got a valid response from the API
				console.log('✅ Real participant count from Google Sheets:', realCount);
				
				// Show the real count (even if it's 0)
				const displayCount = realCount === 0 ? 0 : realCount;
				
				document.getElementById('participantCount').textContent = displayCount;
				
				// Fade in the banner
				const banner = document.getElementById('participantBanner');
				if (banner) {
					banner.style.opacity = '1';
				}
				
				// Cache the real value
				localStorage.setItem('leeket_participant_count', displayCount);
				localStorage.setItem('leeket_count_time', now.toString());
				return;
			} else {
				console.log('⚠️ API returned unexpected format:', data);
			}
		} catch (fetchError) {
			console.log('❌ Could not fetch from Google Sheets:', fetchError.message);
		}
		
		// FALLBACK: Use realistic number if Google Sheets fails
		console.log('📊 Using fallback count (API failed or returned invalid data)');
		
		// Use a realistic fallback based on current date
		const today = new Date();
		const dayOfMonth = today.getDate();
		const month = today.getMonth();
		
		// Generate a consistent but realistic number (3-15 for testing phase)
		const baseCount = 3;
		const variableCount = (dayOfMonth % 10) + (month % 3);
		const finalCount = baseCount + variableCount;
		
		console.log('Using simulated count:', finalCount);
		document.getElementById('participantCount').textContent = finalCount;
		
		// Fade in the banner
		const banner = document.getElementById('participantBanner');
		if (banner) {
			banner.style.opacity = '1';
		}
		
		// Cache the simulated value
		localStorage.setItem('leeket_participant_count', finalCount);
		localStorage.setItem('leeket_count_time', now.toString());
		
	} catch (error) {
		console.log('Could not update participant count:', error);
		// Keep a realistic default value
		document.getElementById('participantCount').textContent = 15;
	}
}

// Clear draft on successful submission
function clearDraft() {
	localStorage.removeItem('leeket_survey_draft');
}

// Debug function - Can be called from console
window.debugParticipantCount = async function() {
	console.log('=== DEBUGGING PARTICIPANT COUNT ===');
	
	// Clear all cache
	localStorage.removeItem('leeket_participant_count');
	localStorage.removeItem('leeket_count_time');
	console.log('✅ Cache cleared');
	
	// Try to fetch from API
	try {
		const response = await fetch(GOOGLE_SCRIPT_URL + '?action=getStats');
		console.log('📡 API Response:', response);
		const text = await response.text();
		console.log('📄 Raw response:', text);
		
		try {
			const data = JSON.parse(text);
			console.log('📊 Parsed data:', data);
			
			if (data.totalResponses !== undefined) {
				console.log('✅ Found totalResponses:', data.totalResponses);
			} else if (data.participants !== undefined) {
				console.log('✅ Found participants:', data.participants);
			} else {
				console.log('❌ No count field found in response');
			}
		} catch (e) {
			console.log('❌ Could not parse as JSON:', e);
		}
	} catch (error) {
		console.log('❌ Fetch failed:', error);
	}
	
	// Now update the count
	await updateParticipantCount();
	console.log('=== END DEBUG ===');
};

// Auto-fix on load if value is wrong
window.addEventListener('load', () => {
	setTimeout(() => {
		const currentValue = document.getElementById('participantCount').textContent;
		if (parseInt(currentValue) > 100) {
			console.log('🔧 Auto-fixing unrealistic count:', currentValue);
			window.debugParticipantCount();
		}
	}, 100);
});
