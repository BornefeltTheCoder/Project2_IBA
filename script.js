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

async function hentVejrData(latitude, longitude) {

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

    }} catch (error) {
        console.error("Fejl i hentning af data fra serveren:", error);
    }
}

function visVejrData(data) {

    const temperatur = data.current.temperature_2m; //henter temperatur fra dataen
    const vejrKode = data.current.weather_code; //henter vejrkode fra dataen
    const vindHastighed = data.current.wind_speed_10m; //henter vindhastighed fra dataen

    console.log("Temperatur:", temperatur);
    console.log("Vejrkode:", vejrKode);
    console.log("Vindhastighed:", vindHastighed);

}
