import { useState, useEffect } from "react";
import { PrivacyPolicy } from "../Components/PrivacyPolicy";
import { TermsOfService } from "../Components/TermsOfService";
import { FaFacebook } from "react-icons/fa";

export function LandingPage() {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  // État pour le menu burger
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  // État pour le lien actif en fonction de la section visible
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.6, // 60% de la section visible
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, options);
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="">
      <div className="flex flex-col min-h-screen">
        {/* Navbar fixe */}
        <nav className="sticky top-0 left-0 w-full z-50 bg-white border border-gray-200 shadow-md">
          <div className="mx-auto px-4 py-4 flex items-center justify-between lg:justify-around">
            {/* Logo et Titre */}
            <div className="flex items-center space-x-2">
              <div>
                <a href="#">
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
                </a>
              </div>

              <div className="text-xl md:text-xl sm:text-xl font-bold">
                <a href="#">Oresto</a>
              </div>
            </div>

            {/* Liens (version Desktop/Tablet) */}
            <div className="hidden lg:flex space-x-6">
              <a
                href="#features"
                className={`px-5 py-4 rounded-md text-xl lg:text-2xl hover:bg-black hover:text-white font-bold ${
                  activeSection === "features" ? "bg-black text-white" : ""
                }`}
              >
                Fonctionnalités
              </a>
              <a
                href="/demo"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-5 py-4 rounded-md text-xl lg:text-2xl hover:bg-black hover:text-white font-bold ${
                  activeSection === "demo" ? "bg-black text-white" : ""
                }`}
              >
                Démonstration
              </a>
              <a
                href="#prices"
                className={`px-5 py-4 rounded-md text-xl lg:text-2xl hover:bg-black hover:text-white font-bold ${
                  activeSection === "prices" ? "bg-black text-white" : ""
                }`}
              >
                Tarifs
              </a>
              <a
                href="#contact"
                className={`px-5 py-4 rounded-md text-xl lg:text-2xl hover:bg-black hover:text-white font-bold ${
                  activeSection === "contact" ? "bg-black text-white" : ""
                }`}
              >
                Contact
              </a>
            </div>

            {/* Bouton burger (mobile) */}
            <div className="lg:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                {/* Icône hamburger (3 barres) en noir */}
                <svg
                  className="h-6 w-6 text-black"
                  viewBox="0 0 24 24"
                  fill="none" /* Pas de remplissage */
                  stroke="currentColor" /* Le trait est en "currentColor" (ici, noir) */
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            <div className="hidden lg:block">
              <a
                href="https://www.facebook.com/oresto.io"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook className="text-blue-600 text-3xl hover:text-blue-800 transition" />
              </a>
            </div>
          </div>

          {/* Menu déroulant (mobile) */}
          {menuOpen && (
            <div className="absolute lg:hidden px-2 pt-2 pb-3 space-y-1 z-50 bg-gray-100 w-full">
              <a
                href="#features"
                className="block px-3 py-2 rounded-md text-base text-black hover:bg-black hover:text-white font-semibold"
              >
                Fonctionnalités
              </a>
              <a
                href="/demo"
                className="block px-3 py-2 rounded-md text-base text-black hover:bg-black hover:text-white font-semibold"
              >
                Démonstration
              </a>
              <a
                href="#prices"
                className="block px-3 py-2 rounded-md text-base text-black hover:bg-black hover:text-white font-semibold"
              >
                Tarifs
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 rounded-md text-base text-black hover:bg-black hover:text-white font-semibold"
              >
                Contact
              </a>
            </div>
          )}
        </nav>
        {/* Fin NAVBAR */}

        {/* Pour éviter que la navbar fixe ne recouvre le contenu, on ajoute un padding-top */}
        <main className="flex-1 pt-20">
          <section
            id="hero"
            className="h-screen flex flex-col items-center justify-start "
          >
            <p className="text-5xl lg:text-5xl md:text-7xl xl:text-8xl w-4/5 sm:text-4xl sm:w-full md:w-4/5 lg:w-3/5 xxl:w-1/5 text-center font-semibold leading-snug md:leading-snug lg:leading-snug xl:leading-snug ">
              Simplifiez la réservation en ligne.
            </p>

            <video
              src="./mp4/preview.mp4" // Mets le bon chemin si nécessaire
              className="
    w-full
    sm:w-full
    md:w-11/12
    lg:w-[17.5%]    // 4.5/12
    xl:w-[32.5%]
    xxl:w-2/5
    mx-auto
  "
              autoPlay
              loop
              muted
              playsInline
            ></video>

            <div className="flex flex-col md:flex md:flex-row md:gap-4 ">
              <a href="#features">
                <button className="relative overflow-hidden px-10 py-6 text-white text-2xl font-semibold rounded-3xl bg-black transition group">
                  <span className="relative z-10">Découvrez l'application</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[#FFC77E] to-[#F57777] right-full group-hover:right-0 transition-all duration-300 ease-in-out" />
                </button>
              </a>
            </div>
          </section>

          <section
            id="features"
            className="h-screen flex flex-col items-center justify-center bg-white mt-16 pt-16"
          >
            <h1 className="text-2xl lg:text-5xl md:text-5xl xl:text-5xl w-4/5 sm:text-4xl sm:w-full md:w-4/5 lg:w-3/5 xxl:w-1/5 text-center pb-5 font-semibold leading-snug md:leading-snug lg:leading-snug xl:leading-snug ">
              Fonctionnalités
            </h1>
          </section>

          {/* <section
            id="demo"
            className="h-screen flex items-center justify-center bg-white"
          >
            <h1 className="text-2xl lg:text-5xl md:text-5xl xl:text-5xl w-4/5 sm:text-4xl sm:w-full md:w-4/5 lg:w-3/5 xxl:w-1/5 text-center pb-5 font-semibold leading-snug md:leading-snug lg:leading-snug xl:leading-snug ">
              Démonstration
            </h1>
          </section> */}

          <section
            id="prices"
            className="h-screen flex items-center justify-center bg-white"
          >
            <h1 className="text-2xl lg:text-5xl md:text-5xl xl:text-5xl w-4/5 sm:text-4xl sm:w-full md:w-4/5 lg:w-3/5 xxl:w-1/5 text-center pb-5 font-semibold leading-snug md:leading-snug lg:leading-snug xl:leading-snug ">
              Nos différents tarifs
            </h1>
          </section>

          <section
            id="contact"
            className="h-screen flex items-center justify-center bg-white"
          >
            <h1 className="text-2xl lg:text-5xl md:text-5xl xl:text-5xl w-4/5 sm:text-4xl sm:w-full md:w-4/5 lg:w-3/5 xxl:w-1/5 text-center pb-5 font-semibold leading-snug md:leading-snug lg:leading-snug xl:leading-snug ">
              Contacter Oresto
            </h1>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-black text-white">
          <p className="text-center text-md py-10 lg:text-xl">
            Développé par
            <a
              href="http://www.linkedin.com/in/xaviercolombel"
              className="font-bold"
              target="_blank"
            >
              {" "}
              Xavier Colombel
            </a>
          </p>
        </footer>

        {/* Pop-ups */}
        {isPrivacyOpen && (
          <PrivacyPolicy onClose={() => setIsPrivacyOpen(false)} />
        )}
        {isTermsOpen && (
          <TermsOfService onClose={() => setIsTermsOpen(false)} />
        )}
      </div>
    </div>
  );
}
