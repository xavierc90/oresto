import React, { useEffect, useState } from 'react';
import { http } from '../../Infrastructure/Http/axios.instance';

// Interface décrivant un restaurant
interface Restaurant {
    _id: string;
    name: string;
    address: string;
    // Ajoutez d'autres champs si nécessaire
}

// Tableau d'images d'exemple (libres de droits – ici, Unsplash).
const sampleImages = [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=3474&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
];

export const SearchPage: React.FC = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [search, setSearch] = useState('');

    // Charger les restaurants depuis le back-end
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await http.get('/restaurants_by_filters');
                const { results } = response.data;
                setRestaurants(results);
            } catch (error) {
                console.error('Erreur lors de la récupération des restaurants :', error);
            }
        };

        fetchRestaurants();
    }, []);

    // Logique de recherche (exemple)
    const handleSearch = () => {
        console.log('Recherche en cours pour :', search);
        // Ici, vous pouvez déclencher votre logique de filtrage
        // ou un nouvel appel à l’API si nécessaire
    };

    return (
        <div className="min-h-screen bg-white">
            {/* -- NAVIGATION -- */}
            <nav className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    {/* Logo + Titre à gauche */}
                    <div className="flex items-center gap-2">
                        <svg
                            width="233"
                            height="230"
                            viewBox="0 0 233 230"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-auto"
                        >
                            <path
                                d="M41 49L63.5 36L159 39L206.5 80.5L216.5 118.5L159 209C140.5 214.167 103.7 225 104.5 227C105.5 229.5 85.5 219 63.5 209C45.9 201 34.1667 191.333 30.5 187.5L14 152.5L41 49Z"
                                fill="white"
                            />

                            {/* Remplacez style="mask-type:luminance" par maskType="luminance" */}
                            <mask
                                id="mask0_35_5"
                                maskUnits="userSpaceOnUse"
                                x="0"
                                y="0"
                                width="232"
                                height="229"
                            >
                                <path d="M0 0H231.891V228.906H0V0Z" fill="white" />
                            </mask>

                            <g mask="url(#mask0_35_5)">
                                <mask
                                    id="mask1_35_5"
                                    maskUnits="userSpaceOnUse"
                                    x="-34"
                                    y="-35"
                                    width="301"
                                    height="296"
                                >
                                    <path
                                        d="M61.3686 -34.5204L266.844 60.0692L172.332 260.107L-33.1283 165.532L61.3686 -34.5204Z"
                                        fill="white"
                                    />
                                </mask>
                                <g mask="url(#mask1_35_5)">
                                    <mask
                                        id="mask2_35_5"
                                        x="-34"
                                        y="-35"
                                        width="301"
                                        height="296"
                                    >
                                        <path
                                            d="M61.3686 -34.5204L266.844 60.0692L172.332 260.107L-33.1283 165.532L61.3686 -34.5204Z"
                                            fill="white"
                                        />
                                    </mask>
                                    <g mask="url(#mask2_35_5)">
                                        <mask
                                            id="mask3_35_5"
                                            maskUnits="userSpaceOnUse"
                                            x="-33"
                                            y="-35"
                                            width="301"
                                            height="295"
                                        >
                                            <path
                                                d="M61.5332 -34.4397L267.27 60.2617L173.192 259.388L-32.5432 164.687L61.5332 -34.4397Z"
                                                fill="white"
                                            />
                                        </mask>
                                        <g mask="url(#mask3_35_5)">
                                            <mask
                                                id="mask4_35_5"
                                                maskUnits="userSpaceOnUse"
                                                x="-33"
                                                y="-35"
                                                width="301"
                                                height="295"
                                            >
                                                <path
                                                    d="M61.5297 -34.4397L267.023 60.1499L172.962 259.245L-32.5307 164.655L61.5297 -34.4397Z"
                                                    fill="white"
                                                />
                                            </mask>
                                            <g mask="url(#mask4_35_5)">
                                                <path
                                                    fillRule="evenodd"
                                                    clipRule="evenodd"
                                                    d="M218.692 162.369C244.232 105.414 218.562 37.8411 161.382 11.5113C111.4 -11.4974 53.8637 4.54963 23.0979 46.9266C30.9429 38.3523 43.1231 28.2928 60.1559 22.848C93.526 12.134 112.257 17.9461 112.257 17.9461C46.2612 21.0917 1.84333 80.0905 2.53888 127.832C5.45047 150.362 15.091 171.822 30.2636 189.178C35.0192 192.931 40.1145 195.533 43.3658 188.332L43.3982 188.348C45.9376 174.632 49.7874 147.935 47.7978 143.001C45.1773 136.582 33.6119 134.075 31.8488 126.97C30.1181 119.817 45.6141 46.9266 45.6141 46.9266C45.6141 46.9266 47.7493 45.9845 48.9139 47.1979C50.0301 48.4913 39.597 115.027 40.713 117.15C41.8128 119.274 41.8775 118.364 42.848 118.859C43.6892 118.987 44.7893 119.338 46.2936 116.703C47.8302 114.021 54.4298 50.4712 54.818 49.5451C55.174 48.5711 56.3061 45.6013 58.2957 46.9904C60.3014 48.3317 53.8152 114.644 54.3974 116.623C55.0282 118.635 55.9341 118.635 56.9207 118.987C57.8266 118.763 58.4089 118.987 59.25 117.198C60.1235 115.458 64.2322 48.8426 66.3834 47.8527C68.551 46.8149 69.2303 49.9443 69.4407 50.9664C69.6347 52.0042 66.1409 115.889 67.2246 118.731C68.2598 121.557 69.3273 121.413 70.1523 121.477C71.2847 121.174 71.2524 122.036 72.7243 120.168C74.1639 118.22 74.3094 50.8225 75.6035 49.7528C76.9297 48.7469 78.9357 50.0882 78.9357 50.0882C78.9357 50.0882 82.5588 124.687 79.7604 131.377C76.9623 138.099 64.6851 139.169 61.1749 145.045C58.4089 149.548 57.6649 180.396 57.9398 196.555C58.1502 199.669 58.8941 204.124 61.3691 206.822C65.4937 211.389 68.5348 210.287 71.0096 205.177L98.9285 147.632C99.6401 145.572 100.206 143.496 100.174 141.756C100.093 139.904 99.5269 138.227 98.8477 136.982C90.21 128.902 87.3467 115.649 95.2243 98.0854C105.253 75.8432 128.756 55.0059 143.266 61.6961C157.791 68.3706 157.759 100.017 147.778 122.276C140.37 138.866 129.484 145.572 118.468 145.237C116.948 145.668 114.78 146.45 113.05 147.791C111.853 148.749 110.51 150.793 109.426 152.885L85.0662 210.239L85.1147 210.255C85.1147 210.255 84.2897 216.706 87.444 217.951C89.0453 218.574 90.9863 217.137 92.5067 215.588L92.4582 215.572C92.4582 215.572 93.0405 214.901 94.1244 213.736C94.6905 213.001 95.0303 212.49 95.0303 212.49L95.1434 212.586C108.828 197.338 170.521 128.487 176.021 121.541C182.248 113.733 197.243 96.2651 201.659 102.429C206.091 108.576 196.531 134.938 179.887 160.901C163.194 186.863 148.878 200.212 138.866 203.98C128.837 207.684 123.127 199.445 115.929 206.535C111.06 211.373 106.515 217.201 104.056 220.49C103.716 221.783 103.247 224.913 105.9 226.653C107.259 227.579 109.103 228.026 110.785 228.266C112.192 228.298 113.632 228.378 115.055 228.362C158.422 228.905 199.847 204.395 218.692 162.369Z"
                                                    fill="url(#paint0_linear_35_5)"
                                                />
                                            </g>
                                        </g>
                                    </g>
                                </g>
                            </g>

                            <defs>
                                <linearGradient
                                    id="paint0_linear_35_5"
                                    x1="115.553"
                                    y1="0.993866"
                                    x2="115.553"
                                    y2="228.371"
                                    gradientUnits="userSpaceOnUse"
                                >
                                    <stop stopColor="#F57777" />
                                    <stop offset="0.787333" stopColor="#FFC77E" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <span className="text-2xl font-bold">Oresto</span>
                    </div>

                    {/* Bouton S'inscrire / Se connecter à droite */}
                    <button
                        className="whitespace-nowrap px-4 py-2 bg-black text-white rounded
                       hover:bg-black focus:outline-none"
                    >
                        S'inscrire / Se connecter
                    </button>
                </div>
            </nav>

            {/* -- BARRE DE RECHERCHE -- */}
            <div className="container mx-auto px-4 mt-6">
                <div className="flex w-full">
                    <input
                        type="text"
                        placeholder="Rechercher un restaurant..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-l px-4 py-2 
                       focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
                    >
                        Rechercher
                    </button>
                </div>
            </div>

            {/* -- LISTE DES RESTAURANTS -- */}
            <div className="container mx-auto px-4 mt-6">
                <h2 className="text-xl font-bold mb-4">Liste des restaurants</h2>

                {restaurants.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded shadow p-4">
                        <p>Aucun restaurant n’a été trouvé.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {restaurants.map((resto, index) => {
                            // Sélectionner l'image depuis le tableau
                            const imageUrl = sampleImages[index % sampleImages.length];

                            return (
                                <div
                                    key={resto._id}
                                    className="bg-white border border-gray-200 rounded shadow flex flex-col"
                                >
                                    {/* Container à hauteur fixe pour l'image */}
                                    <div className="w-full h-48 overflow-hidden rounded-t">
                                        <img
                                            src={imageUrl}
                                            alt="Restaurant example"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Contenu de la card */}
                                    <div className="p-4">
                                        <h3 className="text-lg font-semibold mb-2">
                                            {resto.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{resto.address}</p>

                                        {/* Bouton Réserver */}
                                        <div className='flex items-center justify-end lg:justify-center pt-3'>
                                            <button
                                                onClick={() => {
                                                    // Logique de réservation ou redirection
                                                    console.log('Réserver pour le restaurant :', resto._id);
                                                }}
                                                className="mt-auto bg-black text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none"
                                            >
                                                Réserver
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
