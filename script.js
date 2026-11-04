//funktion til at hente brugerens location.
function findGeoLocation() {
    navigator.geolocation.getCurrentPosition( //henter brugerens lokation

        function (position) { //hvis lokation er hentet, så hentes latitude og longitude
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            //kalder funktionen hentVejr med latitude og longitude som parametre
            hentVejrData(latitude, longitude);
        },

        function (error) {
            console.error("Fejl ved hentning af lokation:", error);
        }
    );
}

async function hentVejrData(latitude, longitude, byNavn) {
    //laver en url til serveren med brugerens koordinater som query parametre
    const url = `/vejr?latitude=${latitude}&longitude=${longitude}`;

    try {
        //sender en http request til vores node.js server og venter på resposne
        const response = await fetch(url);

        //hvis response ikke er ok så sendes der en fejl fra serveren
        if (!response.ok) {
            throw new Error("Fejl fra serveren: " + response.status);
        } else if (response.ok) {

        //hvis responsen er ok, henter vi data fra serveren og konverterer det til JSON format
        const data = await response.json();

        //kalder funktionen visVejrData her for at vise dataen i konsollen
        visVejrData(data);
        // visByNavn(byNavn);

    }} catch (error) {
        console.error("Fejl i hentning af data fra serveren:", error);
    }
}

//vi skal have en function som tager dataen fra serveren og viser det i HTML
function visVejrData(data) {
    const temperatur = data.current.temperature_2m; //henter temperatur fra dataen
    const vejrKode = data.current.weather_code; //henter vejrkode fra dataen
    const vindHastighed = data.current.wind_speed_10m; //henter vindhastighed fra dataen

    visBilleder(vejrKode, temperatur);
    visVejrIcon(vejrKode, "weather_icon_today");

    document.getElementById("temperatur").textContent = temperatur + "°C";
    document.getElementById("currentWind").textContent = vindHastighed;
    document.getElementById("currentTime").textContent = data.current.time.split("T")[1];

    visNæsteDagesTemperatur(data);
    hentUgedage(data);   
}

/*forbinder billeder og vejr via vejrkoder og temperatur*/
function visBilleder(vejrKode, temperatur) {
 
    let type;
 
    const erRegn = (vejrKode >= 51 && vejrKode <= 67) || (vejrKode >= 80 && vejrKode <= 82);
    const erTorden = vejrKode >= 95 && vejrKode <= 99;
    const erSne = (vejrKode >= 71 && vejrKode <= 77) || (vejrKode >= 85 && vejrKode <= 86);
 
    if (erRegn || erTorden) {
        type = "rainy";
    } else if (temperatur < 5 || erSne) {
        type = "cold";
    } else if (temperatur > 20) {
        type = "sunny";
    } else {
        type = "cloudy";
    }
 
    console.log("Type:", type);
 
    const billeder = document.querySelectorAll(".picture-card img");
    console.log("Antal billeder fundet:", billeder.length);
 
    billeder.forEach(function (billede, index) {
        billede.src = `images/${type}${index + 1}.png`;
        console.log("Sat src til:", billede.src);
    });
}

function visVejrIcon(vejrKode, billedID) {
    const vejrIkon = document.getElementById(billedID);
    vejrIkon.src = `images/weather_icons/${vejrKode}.png`;
    vejrIkon.alt = `Vejr ikon for kode ${vejrKode}`;
}

//funktion til at finde brugerens by
function visByNavn(byNavn) {
    const byNavnElement = document.getElementById("cityName");
    byNavnElement.textContent = byNavn;
}

//funktion til at vise temperatur
function visNæsteDagesTemperatur(data) {

    const temperaturDag1 = data.daily.temperature_2m_max[1];
    const temperaturDag2 = data.daily.temperature_2m_max[2];
    const vejrKodeDag1 = data.daily.weather_code[1];
    const vejrKodeDag2 = data.daily.weather_code[2];

    document.getElementById("temperatur_day1").textContent = temperaturDag1 + "°C";
    document.getElementById("temperatur_day2").textContent = temperaturDag2 + "°C";

    visVejrIcon(vejrKodeDag1, "weather_icon_day1");
    visVejrIcon(vejrKodeDag2, "weather_icon_day2");
}

function hentUgedage(data) {
    document.getElementById("day").textContent =
        new Date(data.daily.time[0] + "T00:00:00").toLocaleDateString("da-DK", { weekday: "long" });

    document.getElementById("day1").textContent =
        new Date(data.daily.time[1] + "T00:00:00").toLocaleDateString("da-DK", { weekday: "long" });

    document.getElementById("day2").textContent =
        new Date(data.daily.time[2] + "T00:00:00").toLocaleDateString("da-DK", { weekday: "long" });
}

