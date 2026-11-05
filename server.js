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

       const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&forecast_days=3&models=dmi_seamless&timezone=auto&wind_speed_unit=ms&current=temperature_2m,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max`;

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

     // Hent billeder fra images-mappen
    else if (req.url.startsWith("/images/")) {
 
        fs.readFile("." + req.url, function (error, data) {
 
            if (error) {
                res.writeHead(404);
                res.end("Filen blev ikke fundet.");
                return;
            }
 
            res.writeHead(200, { "Content-Type": "image/png" });
            res.end(data);
 
        });
    }


// BRUGER REGISTRERING

    // Tjekker om både adressen og metode passer.
    if (req.url === "/registrer" && req.method === "POST") {

        // Vores tomme tekststreng der samler vores sendte data
        let body = "";

        // Samler voers data hver gang det ankommer fra browseren.
        req.on("data", function (chunk) {
            body += chunk;
        });

        // Når al data er modtaget, kører denne funktion
        req.on("end", function () {
            try {
                const data = JSON.parse(body); // Laver teksten om til et objekt 
                const brugernavn = String(data.brugernavn || "").trim(); // Og værdien hentes ud

                if (brugernavn.length < 2 || brugernavn.length > 30) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ besked: "Navnet skal være mellem 2 og 30 tegn." }));
                    return;
                }


                // Læser eksisterende brugere, eller starter med en tom liste.
                let brugere = [];
                if (fs.existsSync("brugere.json")) {
                    brugere = JSON.parse(fs.readFileSync("brugere.json", "utf8"))
                }

                // Tjekker om navnet allerede er taget
                const findes = brugere.some(function (bruger) {
                    return bruger.brugernavn.toLowerCase() === brugernavn.toLowerCase();
                });

                if (findes) {
                    res.writeHead(409, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ besked: "Brugernavnet er allerede taget." }));
                    return;
                }

                brugere.push({ brugernavn: brugernavn, oprettet: new Date().toISOString(), tema: "light" });
                fs.writeFileSync("brugere.json", JSON.stringify(brugere, null, 2));

                console.log("Ny bruger registreret:", brugernavn);

                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ besked: "Du er registreret som " + brugernavn + "!" }));


            } catch (error) {
                console.error("Fejl ved registrering", error);
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ besked: "Ugyldig forspørgsel" }));
            };
        });

        return;
    }

    // GEM TEMA

    if (req.url === "/tema" && req.method === "POST") {

        // Vores tomme tekststreng der samler vores sendte data
        let body = "";

        // Samler voers data hver gang det ankommer fra browseren.
        req.on("data", function (chunk) {
            body += chunk;
        });

        // Når al data er modtaget, kører denne funktion
        req.on("end", function () {
            try {
                const data = JSON.parse(body); // Laver teksten om til et objekt 
                const brugernavn = String(data.brugernavn || "").trim(); // Og værdien hentes ud
                const tema = data.tema === "dark" ? "dark" : "light"

                if (!fs.existsSync("brugere.json")) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ besked: "Ingen brugere fundet." }));
                    return;
                }

                const brugere = JSON.parse(fs.readFileSync("brugere.json", "utf-8"));

                const bruger = brugere.find(function (b) {
                    return b.brugernavn.toLowerCase() === brugernavn.toLowerCase();
                });

                if (!bruger) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ besked: "Brugeren findes ikke." }));
                    return;
                }

                bruger.tema = tema;
                fs.writeFileSync("brugere.json", JSON.stringify(brugere, null, 2));

                console.log("Tema gemt for", brugernavn, ":", tema);

                   res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ besked: "Tema gemt." }));


            } catch (error) {
                console.error("Fejl ved tema", error);
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ besked: "Ugyldig forspørgsel" }));
            };
        });
        return;
    }
});

// Start serveren
server.listen(3000, function () {
    console.log("Serveren kører på http://localhost:3000");
});

