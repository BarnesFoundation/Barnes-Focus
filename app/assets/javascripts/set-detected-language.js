// Attempt to get the preferred language from local storage in case it was previously set -- will be null if non-existent
var storedPreferredLanguage = window.localStorage.getItem('barnes.snap.pref.lang');

// If it's falsey
if (!storedPreferredLanguage) {

	// Get the preferred language we detected from the server and set it
	var detectedPreferredLanguage = "<%= @preferred_language %>";
	window.localStorage.setItem('barnes.snap.pref.lang', detectedPreferredLanguage);
}
