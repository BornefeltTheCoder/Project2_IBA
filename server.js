const http = require("http");
const fs = require("fs");

const server = http.createServer(async function (req, res) {

    const url = "https://opendataapi.dmi.dk/v1/forecastedr/collections/harmonie_dini_sf";

    try {
        const response = await fetch(url);

        console.log("Status fra DMI:", response.status);

        const data = await response.json();

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(data));

    } catch (error) {
        console.error("Fejl:", error);

        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Kunne ikke hente data fra DMI");
    }

});

server.listen(3000, function () {
    console.log("Serveren kører på http://localhost:3000");
});

