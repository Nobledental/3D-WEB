// In patient-os.js or a main script
import { translatePage } from './localization.js';

// Language Init
const savedLang = localStorage.getItem('hf_lang') || 'en';
const switcher = document.getElementById('langSwitcher');

if (switcher) {
    switcher.value = savedLang;
    translatePage(savedLang);

    switcher.addEventListener('change', (e) => {
        translatePage(e.target.value);
    });
}
