/**
 * Extraire le token JWT du cookie
 * Cette fonction est utilisée par passport-jwt pour récupérer le token
 * à partir du cookie HTTP-only
 */
const cookieExtractor = function (req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies["auth_token"];
  }
  return token;
};

module.exports = cookieExtractor;
