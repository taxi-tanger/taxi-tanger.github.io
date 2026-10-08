// CONFIGURATION DE VOTRE COMPTE GITHUB (À REMPLIR)
const GITHUB_TOKEN = "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"; // <-- Collez ici votre clé ghp_...
const REPO_OWNER = "taxi-tanger"; // <-- Votre identifiant de connexion GitHub
const REPO_NAME = "taxi-tanger";
const FILE_PATH = "taxis.json";

let donneesTaxis = {};

// Charger les taxis depuis le fichier JSON au démarrage
async function chargerTaxis() {
    try {
        const reponse = await fetch("https://githubusercontent.com" + REPO_OWNER + "/" + REPO_NAME + "/main/" + FILE_PATH + "?t=" + new Date().getTime());
        donneesTaxis = await reponse.json();
        afficherTaxisClients();
    } catch (erreur) {
        console.error("Erreur :", erreur);
    }
}

// Afficher les taxis EN SERVICE sur la page client
function afficherTaxisClients() {
    const conteneur = document.getElementById('liste-taxis');
    if (!conteneur) return;
    conteneur.innerHTML = "";

    let aucunTaxi = true;

    for (let id in donneesTaxis) {
        const taxi = donneesTaxis[id];
        if (!taxi.enService) continue; 
        
        aucunTaxi = false;

        const carteHTML = `
            <div class="taxi-card">
                <div class="badge-distance">🟢 En Service</div>
                <div style="font-size:30px; margin-bottom:10px;">🚖</div>
                <h3>${taxi.type} ${taxi.numeroTaxi}</h3>
                <p style="margin-top:10px; font-size:14px; color:#555;">
                    <strong>Chauffeur :</strong> ${taxi.prenom}<br>
                    <strong>Secteur :</strong> ${taxi.zoneNom}
                </p>
                <a href="https://wa.me{taxi.whatsapp}?text=Bonjour%20${taxi.prenom},%20je%20vous%20vois%20En%20Service%20sur%20le%20site.%20Êtes-vous%20disponible%20?" 
                   target="_blank" class="btn-reserver-taxi">
                   <i class="fab fa-whatsapp"></i> Contacter
                </a>
            </div>
        `;
        conteneur.innerHTML += carteHTML;
    }

    if (aucunTaxi) {
        conteneur.innerHTML = "<p style='color:#666; font-style:italic;'>Aucun chauffeur disponible pour le moment.</p>";
    }
}

// Gestion de changement de statut par mot de passe
async function changerDisponibilite(statutVoulu) {
    const saisieMotDePasse = document.getElementById('code-chauffeur').value.trim();
    const retour = document.getElementById('statut-retour');

    if (!saisieMotDePasse) {
        retour.innerHTML = "❌ Entrez votre mot de passe.";
        retour.style.color = "red";
        return;
    }

    let codeChauffeurTrouve = null;
    for (let id in donneesTaxis) {
        if (donneesTaxis[id].motDePasse === saisieMotDePasse) {
            codeChauffeurTrouve = id;
            break;
        }
    }

    if (!codeChauffeurTrouve) {
        retour.innerHTML = "❌ Mot de passe incorrect.";
        retour.style.color = "red";
        return;
    }

    retour.innerHTML = "⏳ Enregistrement du statut en cours...";
    retour.style.color = "orange";
    donneesTaxis[codeChauffeurTrouve].enService = statutVoulu;

    try {
        const url = `https://github.com{REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        const fichierActuel = await fetch(url, { headers: { "Authorization": `token ${GITHUB_TOKEN}` } });
        const dataFichier = await fichierActuel.json();
        const sha = dataFichier.sha;

        const reponseMiseAJour = await fetch(url, {
            method: "PUT",
            headers: { "Authorization": `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: `Statut mis à jour par ${donneesTaxis[codeChauffeurTrouve].prenom}`,
                content: btoa(unescape(encodeURIComponent(JSON.stringify(donneesTaxis, null, 2)))),
                sha: sha
            })
        });

        if (reponseMiseAJour.ok) {
            retour.innerHTML = statutVoulu ? "✅ Vous êtes en service !" : "✅ Vous êtes hors service.";
            retour.style.color = "green";
            afficherTaxisClients();
        } else {
            retour.innerHTML = "❌ Erreur de serveur GitHub.";
            retour.style.color = "red";
        }
    } catch (err) {
        retour.innerHTML = "❌ Erreur réseau.";
        retour.style.color = "red";
    }
}

window.onload = chargerTaxis;
