// http giver os mulighed for at lave en server
const http = require("http");
//fs giver os mulighed for at læse filer som vores javascript, html og css
const fs = require("fs");

//opretter en server, som kan håndtere requests req = forespørgsler fra klienten, res = svar tilbage til klienten
const server = http.createServer(async function (req, res) {

    // If-statement, der kontrollerer hvilken forespørgsel serveren modtager. Hvis URL'en starter med /vejr, (kig script.js) ved serveren, at browseren ønsker vejrdata.
    if (req.url.startsWith("/vejr")) {

        //opdeler urlen fra script.js for at hente brugerens latitude og longtitude
        const koordinater = req.url.split("?")[1].split("&"); //? markere start på url query parametre, & deler parametrene op så vi har dem hver for sig

        const latitude = koordinater[0].split("=")[1]; //deler latitude og longtitude op ved = tegnet og tager det sidste element i arrayet som er værdien

        const longitude = koordinater[1].split("=")[1]; //tager værdien efter lighedstegnet

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,wind_speed_10m&forecast_days=3&timezone=Europe%2FCopenhagen`;


        //try...catch blok til at håndtere fejl under fetch - sender forespørgslen til Open-Meteo API'en og håndterer svaret som gemmes i response.
        try {

            const response = await fetch(url);
            const data = await response.json();
            console.log("Status fra Open-Meteo:", response.status);

            //hvis response ikke er ok så kastes en fejl med statuskoden fra Open-Meteo API'en
            if (!response.ok) { 
                throw new Error("Open-Meteo fejl: " + response.status); 
            }

            res.writeHead(200, { "Content-Type": "application/json" }); //sætter content type til JSON, så browseren ved, at det er JSON data den modtager
            res.end(JSON.stringify(data)); //konvertere data til JSON format og sender det tilbage til klienten

        } catch (error) {

            console.error("Fejl:", error);

            res.writeHead(500);
            res.end("Kunne ikke hente vejrdata.");

        }
        return;
    }

    // Hent HTML - 
    if (req.url === "/") {

        fs.readFile("index.html", function (error, data) {

            if (error) {
                res.writeHead(404);
                res.end("Filen blev ikke fundet.");
                return;
            }

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);

        });
    }

    // Håndterer forespørgsler på hjemmesidens filer (HTML, CSS og JavaScript).
    // Browseren efterspørger automatisk CSS og JavaScript via index.html,
    // hvorefter serveren læser og sender filerne tilbage med fs.readFile().
    else if (req.url === "/script.js") {

        fs.readFile("script.js", function (error, data) {

            if (error) {
                res.writeHead(404);
                res.end("Filen blev ikke fundet.");
                return;
            }

            res.writeHead(200, { "Content-Type": "text/javascript" });
            res.end(data);

        });
    }

    // Hent CSS
    else if (req.url === "/style.css") {

        fs.readFile("style.css", function (error, data) {

            if (error) {
                res.writeHead(404);
                res.end("Filen blev ikke fundet.");
                return;
            }

            res.writeHead(200, { "Content-Type": "text/css" });
            res.end(data);

        });
    }
});

// Start serveren
server.listen(3000, function () {
    console.log("Serveren kører på http://localhost:3000");
});




//tilføj bruger halløj - præferencer og login
const username = "halløj";


