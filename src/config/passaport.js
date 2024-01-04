import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GitHubStrategy } from "passport-github2";
import userModel from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";

const initializePassport = () => {
  const registerOpts = {
    usernameField: "email",
    passReqToCallback: true,
  };

  passport.use(
    "register",
    new LocalStrategy(registerOpts, async (req, email, password, done) => {
      const {
        body: { first_name, last_name, age },
      } = req;

      if (!first_name || !last_name) {
        return done(new Error("Todos los campos son requeridos."));
      }

      const user = await userModel.findOne({ email });

      if (user) {
        return done(new Error(`Ya existe un usuario con el correo: ${email}`));
      }

      const pass = createHash(password);

      const newUser = await userModel.create({
        email,
        password: pass,
        first_name,
        last_name,
        age,
      });
      done(null, newUser);
    })
  );

  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
          const user = {
            _id: "admin",
            first_name: "Coder",
            last_name: "House",
            email,
            age: "55",
            role: "Admin",
          };
          return done(null, user);
        }
        const user = await userModel.findOne({ email });

        if (!user) {
          return done(new Error("Correo o contraseña invalidos."));
        }

        if (!isValidPassword(user, password)) {
          return done(new Error("Correo o contraseña invalidos."));
        }
        done(null, user);
      }
    )
  );

  passport.use(
    "github",
    new GitHubStrategy(
      {
        clientID: "Iv1.30ed3de975e1ec27",
        clientSecret: "cf781b394c2fdb7a5ae75ebef759d126186e19a2",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        try {
          let user = await userModel.findOne({ email: profile._json.email });

          if (!user) {
            let newUser = {
              first_name: profile._json.name,
              last_name: "",
              email: profile._json.email,
              password: "",
              age: "",
            };
            let result = await userModel.create(newUser);
            return done(null, result);
          }
          done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser(async (user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (uid, done) => {
    if (uid == "admin") {
      const user = {
        _id: "admin",
        first_name: "Coder",
        last_name: "House",
        email: "adminCoder@coder.com",
        age: "55",
        role: "Admin",
      };
      return done(null, user);
    }

    const user = await userModel.findById(uid);
    done(null, user);
  });
};

export default initializePassport;
