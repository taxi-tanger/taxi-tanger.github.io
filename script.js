// CONFIGURATION DE VOTRE COMPTE GITHUB (À REMPLIR)
const GITHUB_TOKEN = "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"; // <-- Collez ici votre clé ghp_...
const REPO_OWNER = "taxi-tanger"; // <-- Votre identifiant de connexion GitHub
const REPO_NAME = "taxi-tanger";
const FILE_PATH = "taxis.json";

let donneesTaxis = {};

// Charger les taxis directement avec le lien fixe
async function chargerTaxis() {
    try {
        const urlFichier = "https://githubusercontent.com" + new Date().getTime();
        const reponse = await fetch(urlFichier);
        donneesTaxis = await reponse.json();
        afficherTaxisClients();
    } catch (erreur) {
        console.error("Erreur de chargement :", erreur);
        document.getElementById('liste-taxis').innerHTML = "<p style='color:red;'>Impossible de charger les taxis. Vérifiez le fichier taxis.json.</p>";
    }
}

// Afficher les taxis
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
                <a href="https://wa.me{taxi.whatsapp}?text=Bonjour%20${taxi.prenom},%20je%20vous%20vois%20En%20Service.%20Êtes-vous%20libre%20?" 
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

// Changement de statut pour le chauffeur
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

    retour.innerHTML = "⏳ Enregistrement en cours...";
    retour.style.color = "orange";
    donneesTaxis[codeChauffeurTrouve].enService = statutVoulu;

    try {
        const urlAPI = "https://github.com";
        const fichierActuel = await fetch(urlAPI, { headers: { "Authorization": "token " + GITHUB_TOKEN } });
        const dataFichier = await fichierActuel.json();
        const sha = dataFichier.sha;

        const reponseMiseAJour = await fetch(urlAPI, {
            method: "PUT",
            headers: { "Authorization": "token " + GITHUB_TOKEN, "Content-Type": "application/json" },
            body: JSON.stringify({
                message: "Statut modifié par un chauffeur",
                content: btoa(unescape(encodeURIComponent(JSON.stringify(donneesTaxis, null, 2)))),
                sha: sha
            })
        });

        if (reponseMiseAJour.ok) {
            retour.innerHTML = statutVoulu ? "✅ En service !" : "✅ Hors service.";
            retour.style.color = "green";
            afficherTaxisClients();
        } else {
            retour.innerHTML = "❌ Erreur de droits GitHub (Vérifiez le Token).";
            retour.style.color = "red";
        }
    } catch (err) {
        retour.innerHTML = "❌ Erreur réseau.";
        retour.style.color = "red";
    }
}

window.onload = chargerTaxis;
