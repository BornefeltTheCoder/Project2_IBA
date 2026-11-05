
//tekster til påklædning
const clothingText = {
    rainy: {
        greeting: "Hej -navn-",
        description: "Det regner, så en god regnjakke og et par gummistøvler er et oplagt valg. Tag også gerne en paraply med, hvis regnen tager til. Så er du godt forberedt og kan holde dig tør, når du skal udenfor."
    },
    cold: {
        greeting: "Hej -navn-",
        description: "Det er koldt udenfor, så det er tid til at finde det varme tøj frem. En vinterjakke, hue, handsker og et par varme støvler er et godt valg. Så er du godt klædt på til de lave temperaturer, når du skal udenfor."
    },
    sunny: {
        greeting: "Hej -navn-",
        description: "Temperaturen er høj, så det er tid til at finde sommertøjet frem. En T-shirt, shorts og et par sandaler passer godt til det varme vejr. Husk også solcreme, hvis du skal opholde dig i solen i længere tid."
    },
    cloudy: {
        greeting: "Hej -navn-",
        description: "Vejret er hverken for varmt eller for koldt, så en let trøje, lange bukser og et par sneakers passer godt til temperaturen."
    }
};

const Default_Location = {
    latitude: 55.40,
    longitude: 10.39,
    byNavn: "Odense"
};

//funktion til at hente brugerens location.
function findGeoLocation() {
    if (!navigator.geolocation) {
        brugDefaultLokation();
        return;
    }

    navigator.geolocation.getCurrentPosition( //henter brugerens lokation
        function (position) { //hvis lokation er hentet, så hentes latitude og longitude
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            //kalder funktionen hentVejr med latitude og longitude som parametre
            hentVejrData(latitude, longitude);
        },

        function (error) {
            console.error("Fejl ved hentning af lokation:", error);
            brugDefaultLokation();
        },
        { timeout: 8000 }
    );
}

function brugDefaultLokation() {
    hentVejrData(
        Default_Location.latitude,
        Default_Location.longitude,
        Default_Location.byNavn
    );
}

async function hentVejrData(latitude, longitude, byNavn) {
    //laver en url til serveren med brugerens koordinater som query parametre
    const url = `/vejr?latitude=${latitude}&longitude=${longitude}`;
    
    try {
        //sender en http request til vores node.js server og venter på response
        const response = await fetch(url);

        //hvis response ikke er ok så sendes der en fejl fra serveren
        if (!response.ok) {
            throw new Error("Fejl fra serveren: " + response.status);
        }

        //hvis responsen er ok, henter vi data fra serveren og konverterer det til JSON format
        const data = await response.json();

        //kalder funktionen visVejrData her for at vise dataen
        visVejrData(data);

        if (byNavn) {
            document.getElementById("cityName").textContent = byNavn;
        } else {
            visByNavn(latitude, longitude);
        }

    } catch (error) {
        console.error("Fejl i hentning af data fra serveren:", error);
    }
}

//vi skal have en function som tager dataen fra serveren og viser det i HTML
function visVejrData(data) {
    const temperatur = data.current.temperature_2m; //henter temperatur fra dataen
    const vejrKode = data.current.weather_code; //henter vejrkode fra dataen
    const vindHastighed = data.current.wind_speed_10m; //henter vindhastighed fra dataen

    visBilleder(vejrKode, temperatur);
   //rettet så det passer med visVejrIcon function
    visVejrIcon(data.current.weather_code, "weather_icon_today");

    document.getElementById("temperatur").textContent = temperatur + "°C";
    document.getElementById("currentWind").textContent = vindHastighed;
    document.getElementById("currentTime").textContent = data.current.time.split("T")[1];

    visNæsteDagesTemperatur(data);
    hentUgedage(data);
}

/*forbinder billeder og tekst med vejr via vejrkoder og temperatur*/
function visBilleder(vejrKode, temperatur) {

    let type;

    const erRegn = (vejrKode >= 51 && vejrKode <= 67) || (vejrKode >= 80 && vejrKode <= 82);
    const erTorden = vejrKode >= 95 && vejrKode <= 99;
    const erSne = (vejrKode >= 71 && vejrKode <= 77) || (vejrKode >= 85 && vejrKode <= 86);

    if (erRegn || erTorden) {
        type = "rainy";
    } else if (temperatur < 12 || erSne) {
        type = "cold";
    } else if (temperatur > 20) {
        type = "sunny";
    } else {
        type = "cloudy";
    }

    console.log("Type:", type);

    //billeder
    const billeder = document.querySelectorAll(".picture-card img");
    console.log("Antal billeder fundet:", billeder.length);

    billeder.forEach(function (billede, index) {
        billede.src = `images/${type}${index + 1}.png`;
        console.log("Sat src til:", billede.src);
    });

    // Tekst
    const greeting = document.querySelector(".text-card h2");
    const description = document.querySelector(".text-card p");

    // NYT: Henter det registrerede brugernavn fra localStorage.
    // Hvis der ikke er gemt et navn, bruges en tom tekst (så der ikke står "null").
    const navn = localStorage.getItem("brugernavn") || "";

    if (greeting && description) {
        // NYT: Erstatter pladsholderen "-navn-" med brugerens rigtige navn.
        // Hvis der ikke er noget navn, fjernes også mellemrummet, så der bare står "Hej".
        greeting.textContent = clothingText[type].greeting.replace(" -navn-", navn ? " " + navn : "");
        description.textContent = clothingText[type].description;
    }
}

//opdateret function til korrekt visning af ikoner
function visVejrIcon(vejrKode, billedID) {
    const vejrIkon = document.getElementById(billedID);

    let ikon;

    const erKlar = vejrKode === 0;
    const erSkyet = vejrKode >= 1 && vejrKode <= 3;
    const erRegn = (vejrKode >= 51 && vejrKode <= 67) || (vejrKode >= 80 && vejrKode <= 82);
    const erSne = (vejrKode >= 71 && vejrKode <= 77) || (vejrKode >= 85 && vejrKode <= 86);
    const erTorden = vejrKode >= 95 && vejrKode <= 99;

    if (erKlar) {
        ikon = "klar";
    } else if (erSkyet) {
        ikon = "skyet";
    } else if (erRegn) {
        ikon = "regn";
    } else if (erSne) {
        ikon = "sne";
    } else if (erTorden) {
        ikon = "torden";
    } else {
        ikon = "skyet"; // fallback, fx tåge (45, 48) som ikke er dækket
    }

    vejrIkon.src = `images/icons/${ikon}.png`;
    vejrIkon.alt = `Vejrikon: ${ikon}`;
}

//funktion til at finde brugerens by
async function visByNavn(latitude, longitude) {
    try {
        const url = `https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}&lang=en`;

        const response = await fetch(url);
        if(!response.ok) {
            throw new error("fejl fra Photon API" + response.status);
        }
        const data = await response.json();

        const properties = data.features[0]?.properties;

        const byNavn = properties?.city || properties?.town || properties?.village || "Ukendt by";
        document.getElementById("cityName").textContent = byNavn;

    } catch (error) {
        console.error("Fejl ved hentning af bynavn:", error);
    }
}

//funktion til at vise temperatur
function visNæsteDagesTemperatur(data) {

    const temperaturDag1 = data.daily.temperature_2m_max[1];
    const temperaturDag2 = data.daily.temperature_2m_max[2];
    const vejrKodeDag1 = data.daily.weather_code[1];
    const vejrKodeDag2 = data.daily.weather_code[2];

    document.getElementById("temperatur_day1").textContent = temperaturDag1 + "°C";
    document.getElementById("temperatur_day2").textContent = temperaturDag2 + "°C";

    //rettet så den passer med visVejrIcons funktion
    visVejrIcon(data.daily.weather_code[1], "weather_icon_day1");
    visVejrIcon(data.daily.weather_code[2], "weather_icon_day2");
}

function hentUgedage(data) {
    document.getElementById("day").textContent =
        new Date(data.daily.time[0] + "T00:00:00").toLocaleDateString("da-DK", { weekday: "long" });

    document.getElementById("day1").textContent =
        new Date(data.daily.time[1] + "T00:00:00").toLocaleDateString("da-DK", { weekday: "long" });

    document.getElementById("day2").textContent =
        new Date(data.daily.time[2] + "T00:00:00").toLocaleDateString("da-DK", { weekday: "long" });
}


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

async function søgEfterBy(location) {
    try{
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=10&language=da&format=json&countryCode=DK`;

        const response = await fetch(url);
        const data = await response.json();

        if(!data.results) {
            weatherResult.textContent = "Kunne ikke finde indtastede by";
            return;
        }
        const by = data.results[0];

        hentVejrData(by.latitude, by.longitude, by.name);
    } catch (error) {
        console.error("fejl ved søgning", error)
        weatherResult.textContent = "der opstod en fejl ved søgning"
    }
}

// Registrerer når brugeren søger
searchForm.addEventListener("submit", function (event) {
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
        søgEfterBy(location);

    } else {
        weatherResult.style.display = "block";

        // Viser fejlbesked ved ugyldigt input
        weatherResult.textContent = "Indtast venligst et gyldigt dansk bynavn eller postnummer.";
    }
});


// ---------- BRUGERREGISTRERING (dialog) ----------
// NYT: Erstatter den gamle registrerings-formular. Dialogen (#lock-screen) står i index.html.

const lockScreen = document.getElementById("lock-screen");
const unlockBtn = document.getElementById("unlock-btn");
const inputField = document.getElementById("input-field");
const warningText = document.getElementById("warning-text");

// NYT: Dialogen vises kun, hvis brugeren IKKE allerede har et navn gemt i localStorage.
// showModal() låser baggrunden (show() gør ikke).
if (!localStorage.getItem("brugernavn")) {
    lockScreen.showModal();
}

// NYT: Forhindrer, at dialogen lukkes med Escape-tasten.
lockScreen.addEventListener("cancel", (e) => e.preventDefault());

// NYT: Når brugeren trykker på "Bekræft", tjekkes navnet og sendes til serveren.
unlockBtn.addEventListener("click", () => {
    const brugernavn = inputField.value.trim();

    if (brugernavn === "") {
        warningText.textContent = "Du skal skrive et brugernavn";
        return;
    }

    registrerBruger(brugernavn);
});

// NYT: Sender navnet til serveren og lukker først dialogen, når serveren har godkendt det.
async function registrerBruger(brugernavn) {
    try {
        // Post fordi vi sender data der skal gemmes
        const response = await fetch("/registrer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brugernavn: brugernavn })
        });

        // Parser teksten til et objekt
        const data = await response.json();

        // Hvis serveren afviser navnet (fx for kort eller allerede taget),
        // vises serverens besked i dialogen, og dialogen forbliver åben.
        if (!response.ok) {
            warningText.textContent = data.besked;
            return;
        }

        // Alt er godt: gem navnet, ryd feltet og luk dialogen.
        localStorage.setItem("brugernavn", brugernavn);
        warningText.textContent = "";
        inputField.value = "";
        lockScreen.close();

         const greeting = document.querySelector(".text-card h2");
        if (greeting) {
            greeting.textContent = "Hej " + brugernavn;
        }

    } catch (error) {
        console.error("Fejl ved registrering", error);
        warningText.textContent = "Kunne ikke kontakte serveren.";
    }
}


// ---------- DARK MODE ----------
// NYT: Dark mode gemmes i localStorage og sendes til serveren, hvis brugeren er registreret.

const toggleBtn = document.getElementById("toggle-mode");

if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");
}

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const tema = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("tema", tema);

    const brugernavn = localStorage.getItem("brugernavn");
    if (brugernavn) {
        fetch("/tema", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brugernavn: brugernavn, tema: tema })
        });
    }
});


// Henter vejret når siden indlæses
findGeoLocation();
