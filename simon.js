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






    // Opsætning af brugerlogin

const registrerForm = document.querySelector(".registrer-form")
const registrerInput = document.getElementById("registrer")
const registrerBesked = document.getElementById("registrer-besked")

registrerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Tager brugerens skrevne værdi.
    const brugernavn = registrerInput.value.trim();

    if (brugernavn === "") {
        registrerBesked.textContent = "Du skal skrive et navn"
        return;
    }

    // Er navnet godtaget sendes funktionen afsted
    registrerBruger(brugernavn);
});

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

        // Hvis serveren fejler svarer den med en fejlmeddelelse 
        if (!response.ok) {
            registrerBesked.textContent = data.besked;
            return;
        }

        // Hvis alt er godt bliver inputet feltet tømt.
        registrerBesked.textContent = data.besked;
        registrerInput.value = "";
        localStorage.setItem("brugernavn", brugernavn);

    } catch (error) {
        console.error("Fejl ved registrering", error);
        registrerBesked.textContent = "Kunne ikke kontakte serveren.";
    }
}

const toggleBtn = document.getElementById("toggle-mode")

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
            headers: {"Content-Type": "application/json" },
            body: JSON.stringify({ brugernavn: brugernavn, tema: tema})
        });
    }
});