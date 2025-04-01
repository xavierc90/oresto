// Script d'initialisation du widget
(function () {
  // Créer l'élément div qui contiendra le widget
  const widgetContainer = document.createElement("div");
  widgetContainer.id = "oresto-widget-container";
  document.body.appendChild(widgetContainer);

  // Créer l'élément script qui chargera le widget
  const script = document.createElement("script");
  script.src = "https://widget.oresto.fr/widget.js"; // URL à remplacer par l'URL réelle du widget
  script.setAttribute("data-restaurant-id", window.ORESTO_RESTAURANT_ID || ""); // Récupérer l'ID du restaurant depuis la variable globale
  script.async = true;

  // Ajouter le script à la page
  document.head.appendChild(script);
})();
