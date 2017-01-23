const LocalStrategy = require('passport-local').Strategy;

const User = require('../app/models/user');

module.exports = function (passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

    // used to deserialize the user
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================

  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  },
    (req, email, password, done) => {
        // User.findOne wont fire unless data is sent back
      process.nextTick(() => {
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email': email }, (err, user) => {
          if (err) {
            return done(err);
          }


          if (email.length > 15) { // limit nickname length to 15
            return done(null, false, req.flash('signupMessage', 'Username cannot be longer than 15 characters.'))
          }

            // check to see if theres already a user with that email
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {
                // if there is no user with that email
                // create the user
            const newUser = new User();

                // set the user's local credentials
            newUser.local.email = email;
            newUser.local.password = newUser.generateHash(password);

                // save the user
            newUser.save((err) => {
              if (err) {
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      });
    }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================

  passport.use('local-login', new LocalStrategy({
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true,
  },
  function(req, email, password, done) { // callback with email and password from our form

      // checking to see if the user trying to login already exists
      User.findOne({ 'local.email' :  email }, function(err, user) {
          if (err)
              return done(err);

          // if no user is found, return the message
          if (!user)
              return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

          // if the user is found but the password is wrong
          if (!user.validPassword(password))
              return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

          // all is well, return successful user
          return done(null, user);
      });

  }));
};
