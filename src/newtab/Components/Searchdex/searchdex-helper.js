

export async function getGoogleSuggestions(query) {
    // * Never change the client perameter in this url as other wise the response will be different/complex
    const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data[1] || [];

    } catch (e) {
        console.log(e);
        if (e.message.includes("Failed to fetch") || e instanceof TypeError) {
            alert("Go to browser://extensions (replace browser with the name of your browser) and grant this extension access to https://suggestqueries.google.com/* to enable suggestions. If it still hasn't resolved then contact developer. Alternatively, you can turn off suggestions from the extension’s settings.");
        }
        else {
            alert("Something went wrong. Please turn off suggestions or contact the developer for help.");
        }
        // ! Removing this will cause loop of errors showing because the function will run again and again on I might change this part later
        document.activeElement.blur();
        return [];
    }
}


export function recognizeVoice(setIsRecognitionActive, recognitionLanguage) {
    // ? Error is already being handled here so no need to reject
    return new Promise((resolve) => {
        if (!('webkitSpeechRecognition' in window)) {
            alert('Your browser does not support voice recognition.');
            return resolve(null);
        }

        if (navigator.brave) {
            alert("Sorry, Brave does not support this feature.");
            return resolve(null);
        }

        setIsRecognitionActive(true);

        const recognition = new webkitSpeechRecognition();
        recognition.lang = recognitionLanguage;
        recognition.interimResults = false;

        let hasResolved = false;

        recognition.start();

        recognition.onaudiostart = () => { };

        recognition.onspeechend = () => {
            recognition.stop();
        };

        recognition.onresult = (event) => {
            const query = event.results[0][0].transcript;
            setIsRecognitionActive(false);
            hasResolved = true;
            resolve(query);
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            setIsRecognitionActive(false);

            if (event.error === "aborted") {
                alert('Voice recognition failed: ' + event.error + ", try refreshing your page.");
            } else if (event.error === "network") {
                alert('Voice recognition failed: ' + event.error + ".\nNote that: This feature is not supported on Vivaldi.");
            }

            hasResolved = true;
            resolve(null);
        };

        recognition.onend = () => {
            setIsRecognitionActive(false);

            if (!hasResolved) {
                resolve(null);
            }
        };
    });
}