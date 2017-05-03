const Game = require('./models/game.js');
const csrf = require('csurf');
cons = csrf({ cookie: true });

module.exports = function (app, passport) {
  // HOME PAGE
  app.get('/', (req, res) => {
    if (req.user) {
      res.render('index.ejs', {  username: req.user.local.email }); // load the index.ejs file      
    } else {
      console.log('plz disable db submit for guest & score === 0');
      res.render('index.ejs', { username: false });
    }
  });

  // LOG IN PAGE
  app.get('/login', (req, res) => {
      // render the page and pass in any flash data if it exists
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // PROCESS LOGIN
  app.post('/login', sanitize, passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));
  
  // SIGN UP PAGE
  app.get('/signup', (req, res) => {
      // render the page and pass in any flash data if it exists
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // PROCESS SIGN UP
  app.post('/signup', sanitize, passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true, // allow flash messages
  }));

  // PROCESS GAME SCORE
  app.post('/submit', isLoggedIn, sanitize, (req, res) => {
    // insert into db
    const player = req.user.local.email;
    const game = new Game({ game: { player: player, score: req.body.score }});
    game.save((err, round) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      }
      res.json(round);
    });
  });

  // GET TOP 10 SNEKS
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

  // PROCESS LOGOUT
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

// middleware for injection
function sanitize(req, res, next) {
  if (req.body.score !== undefined)    req.body.score    = Number(req.body.score);
  if (req.body.email !== undefined)    req.body.email    = String(req.body.email).replace(/['"\\;{}]+/g, '');
  if (req.body.password !== undefined) req.body.password = String(req.body.password).replace(/['"\\;{}]+/g, '');
  return next();
}
