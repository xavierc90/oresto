(function () {
  // S'assurer que le code s'exécute après le chargement du DOM
  document.addEventListener("DOMContentLoaded", function () {
    // Récupérer le conteneur du widget
    const widgetContainer = document.getElementById("widget-container");

    if (!widgetContainer) {
      console.error("Conteneur du widget non trouvé.");
      return;
    }

    // Récupérer l'URL du site depuis l'attribut data-site-url
    const url = widgetContainer.getAttribute("data-site-url");

    if (!url) {
      console.error("La variable site URL n'est pas définie.");
      return;
    }

    // Utiliser l'URL de l'API de l'environnement de production
    const apiUrl = "https://orestoback-production.up.railway.app";
    console.log("URL de l'API utilisée:", apiUrl);

    // URL complète de l'endpoint
    const endpoint = `${apiUrl}/get-restaurant-id?url=${encodeURIComponent(
      url,
    )}`;
    console.log("Endpoint appelé:", endpoint);

    // Faire une requête à votre backend pour obtenir le restaurant_id correspondant à l'URL
    fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    })
      .then((response) => {
        console.log("Statut de la réponse:", response.status);
        return response.json();
      })
      .then((data) => {
        console.log("Données reçues:", data);
        const restaurantId = data.restaurant_id;
        if (!restaurantId) {
          console.error("Aucun restaurant_id trouvé pour cette URL.");
          return;
        }

        // Maintenant, vous pouvez initialiser le widget avec le restaurantId
        // Créer le bouton "Réserver en ligne"
        const button = document.createElement("button");
        button.textContent = "Réserver en ligne";
        button.className =
          "btn-light uppercase text-sm hover:text-black cursor-pointer";
        widgetContainer.appendChild(button);

        // Ajouter l'événement au clic pour ouvrir le widget
        button.addEventListener("click", function () {
          // Vérifier si le widget est déjà affiché
          if (document.getElementById("widget-modal")) {
            return;
          }

          // Créer le conteneur du widget
          const widgetModal = document.createElement("div");
          widgetModal.id = "widget-modal";
          widgetModal.className =
            "fixed top-0 left-0 w-full h-full flex items-center justify-center z-50";
          widgetModal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

          // Contenu du widget
          const widgetContent = document.createElement("div");
          widgetContent.className = "bg-white p-4 rounded-lg relative";
          widgetContent.style.width = "90%";
          widgetContent.style.maxWidth = "500px";

          // Ajouter le contenu du widget (formulaires, informations, etc.)
          widgetContent.innerHTML = `
              <div>
                <h2>Réserver une table</h2>
                <p>Bienvenue sur le système de réservation de ${url}.</p>
                <p>Restaurant ID: ${restaurantId}</p>
                <!-- Vos formulaires ou autres contenus ici -->
              </div>
            `;

          // Bouton pour fermer le widget
          const closeButton = document.createElement("button");
          closeButton.textContent = "X";
          closeButton.className = "absolute top-2 right-2 text-black";
          closeButton.style.background = "none";
          closeButton.style.border = "none";
          closeButton.style.fontSize = "1.5rem";
          closeButton.style.cursor = "pointer";
          closeButton.addEventListener("click", function () {
            document.body.removeChild(widgetModal);
          });

          widgetContent.appendChild(closeButton);
          widgetModal.appendChild(widgetContent);
          document.body.appendChild(widgetModal);
        });
      })
      .catch((error) => {
        console.error(
          "Erreur lors de la récupération du restaurant_id:",
          error,
        );
      });
  });
})();
