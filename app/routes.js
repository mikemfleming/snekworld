module.exports = function (app, passport) {
  const Game = require('./models/game.js');
  // =====================================
  // HOME PAGE (with login links) ========
  // =====================================
  
  app.get('/', (req, res) => {
    if (req.user) {
      res.render('index.ejs', {  username: req.user.local.email}); // load the index.ejs file      
    } else {
      res.render('index.ejs', { username: false });
    }
  });

  // =====================================
  // LOGIN ===============================
  // =====================================
  // show the login form
  app.get('/login', (req, res) => {
      // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  // =====================================
  // SIGNUP ==============================
  // =====================================
  // show the signup form
  app.get('/signup', (req, res) => {
      // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true, // allow flash messages
  }));

  // submit score
  app.post('/submit', isLoggedIn, (req, res) => {
    // insert into db
    const player = req.user.local.email;
    console.log(player, req.body.score)
    const game = new Game({ game: { player: player, score: req.body.score }});
    game.save((err, round) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      res.json(round);
    });
  });

  //get top ten
  app.get('/top', isLoggedIn, (req, res) => {
    // build query
    const topTen = Game.find()
      .sort({ 'game.score': 'desc' })
      .limit(10);
    // execute and send
    topTen.exec((err, data) => {
      if (err) {
        console.log(err);
        res.send(500);
      }
      res.json(data);
    });
  });
  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile.ejs', {
      user: req.user, // get the user out of session and pass to template
    });
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated()) {
    return next();
  }

  // if they aren't redirect them to the home page
  res.redirect('/');
}
