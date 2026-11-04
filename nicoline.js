// Henter elementerne fra HTML
const searchForm = document.querySelector(".search-form");
const cityInput = document.querySelector("#city");
const weatherResult = document.querySelector(".weather-result");

// RegEx til danske bynavne og postnumre
const locationRegex = /^(?:\d{4}(?:\s+[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*)?|[\p{L}\p{M}]+(?:[ '-][\p{L}\p{M}]+)*)$/u;

// Funktion til at validere brugerens input
function validateLocation(location) {
    // .test() kontrollerer om inputtet matcher RegEx'en og returnerer true eller false
    return locationRegex.test(location);
}

// Registrerer når brugeren søger
searchForm.addEventListener("submit", function(event) {
    // Forhindrer siden i at genindlæse
    event.preventDefault();

    // Henter og rydder brugerens input
    const location = cityInput.value.trim();

    // Kontrollerer om inputtet er gyldigt
    // Her kan API-funktionen senere kaldes med location
    if (validateLocation(location)) {
        weatherResult.style.display = "block";

        // Midlertidig testtekst - erstattes når API'en kobles på
        weatherResult.textContent = `Søger efter: ${location}`;

    } else {
        weatherResult.style.display = "block";

        // Viser fejlbesked ved ugyldigt input
        weatherResult.textContent = "Indtast venligst et gyldigt dansk bynavn eller postnummer.";
    }
});