const passport = require("passport");
const passportJWT = require("passport-jwt");
const Config = require("../config");
const User = require("../schemas/User");
const { APIError } = require("../middlewares/errorHandler");
const cookieExtractor = require("./cookieExtractor");

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    cookieExtractor,
    ExtractJwt.fromAuthHeaderAsBearerToken(),
  ]),
  secretOrKey: Config.secret_key,
};

passport.use(
  new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload._id).populate("restaurant");

      if (!user) {
        throw new APIError(
          "Utilisateur non trouvé",
          401,
          "authentication_error",
        );
      }

      if (user.is_deleted) {
        throw new APIError("Ce compte a été supprimé", 401, "account_deleted");
      }

      return done(null, user);
    } catch (error) {
      if (error instanceof APIError) {
        return done(error, false);
      }
      return done(
        new APIError(
          "Erreur lors de l'authentification",
          500,
          "authentication_error",
          { originalError: error.message },
        ),
        false,
      );
    }
  }),
);

module.exports = passport;
