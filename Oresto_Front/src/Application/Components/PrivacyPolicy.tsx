import React from 'react';
import { IoCloseOutline } from "react-icons/io5";

interface PrivacyPolicyProps {
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  // Générer la date actuelle au format français
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-md max-w-4xl w-full relative overflow-y-auto max-h-screen">
        <div className='absolute top-10 right-10 lg:top-5 lg:right-5 cursor-pointer'>
        <IoCloseOutline 
        onClick={onClose}
        size={30} />
        </div>
        
        {/* Titre */}
        <h2 className="text-3xl text-center font-bold mb-4 mt-12 lg:mt-5 ">Politique de confidentialité</h2>
        <p className="mb-6 text-center lg:text-base">Dernière mise à jour le {currentDate}</p>
        
        {/* Contenu de la Politique de Confidentialité */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold">1. Responsable du traitement des données :</h3>
          <p className='text-lg lg:text-base'>
            Entreprise : Oresto<br/>
            Fondateur : Xavier Colombel<br/>
            Adresse : 18, rue Hubert Metzger, Belfort 90000<br/>
            Email : <a href="mailto:contact@oresto.io" className="underline hover:text-green-700">contact@oresto.io</a>
          </p>
          
          <h3 className="text-xl font-bold">2. Données personnelles collectées :</h3>
          <p className='text-lg lg:text-base'>
            Lors de l'utilisation de l'application Oresto, nous collectons les informations personnelles suivantes :
          </p>
          <ul className="list-disc list-inside mb-4 text-lg lg:text-base">
            <li>Nom de famille</li>
            <li>Prénom</li>
            <li>Adresse e-mail</li>
            <li>Numéro de téléphone</li>
            <li>Allergènes (facultatif)</li>
          </ul>
          <p>
            Ces données sont nécessaires pour permettre aux utilisateurs de créer un compte, de réserver une table dans un restaurant, et d'assurer la communication entre les restaurants et les utilisateurs.
          </p>
          
          <h3 className="text-xl font-bold">3. Utilisation des données :</h3>
          <p className='text-lg lg:text-base'>
            Les données collectées sont utilisées pour :
          </p>
          <ul className="list-disc list-inside mb-4 text-lg lg:text-base">
            <li>La gestion des réservations dans les restaurants partenaires.</li>
            <li>L'envoi de confirmations ou de rappels de réservation par email ou téléphone.</li>
            <li>L'assistance utilisateur en cas de problème technique ou de demande liée à une réservation.</li>
          </ul>
          
          <h3 className="text-xl font-bold">4. Conservation des données :</h3>
          <p className='text-lg lg:text-base'>
            Vos données personnelles sont conservées aussi longtemps que nécessaire pour la gestion des services de réservation, ou conformément aux obligations légales applicables.
          </p>
          
          <h3 className="text-xl font-bold">5. Partage des données :</h3>
          <p className='text-lg lg:text-base'>
            Les informations collectées ne sont partagées qu'avec les restaurants où vous effectuez une réservation. 
            Nous ne vendons ni ne partageons vos données avec des tiers à des fins commerciales.
          </p>
          
          <h3 className="text-xl font-bold">6. Sécurité des données :</h3>
          <p className='text-lg lg:text-base'>
            Nous mettons en œuvre des mesures techniques et organisationnelles afin de protéger vos données contre tout accès non autorisé, perte, ou altération.
          </p>
          
          <h3 className="text-xl font-bold">7. Vos droits :</h3>
          <p className='text-lg lg:text-base'>
            Conformément à la réglementation sur la protection des données personnelles, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-lg lg:text-base">
            <li>Droit d'accès à vos données.</li>
            <li>Droit de rectification en cas de données inexactes.</li>
            <li>Droit à l'effacement de vos données dans certaines conditions.</li>
            <li>Droit à la limitation du traitement.</li>
          </ul>
          <p className='text-lg lg:text-base'>
            Pour exercer vos droits, vous pouvez nous contacter par email à : <a href="mailto:contact@oresto.io" className='hover:text-green-700 underline'>contact@oresto.io</a>
          </p>
          
          <h3 className="text-xl font-bold">8. Modifications de la politique de confidentialité :</h3>
          <p className='text-lg lg:text-base'>
            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications seront effectives dès leur publication sur l'application.
          </p>
        </div>
        
        {/* Bouton pour revenir sur le site */}
        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="text-lg xl:text-sm bg-black text-white font-semibold py-4 lg:py-4 px-6 rounded-md hover:bg-green-800 transition duration-300"
          >
            Revenir sur le site
          </button>
        </div>
      </div>
    </div>
  );
};
