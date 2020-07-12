const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
/* const csrf = require('csurf'); */
const flash = require('connect-flash');
const mongoConnect = require('./util/database').mongoConnect;

const errorController = require('./controllers/error');

const app = express();

const MONGODB_URI = 'mongodb+srv://luan:luan9999@cluster0-3ddfx.mongodb.net/shop';
/* const csrfProtection = csrf(); */

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop'); 

/* const authRoutes = require('./routes/auth'); */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const store = new MongoDBStore({
  uri: MONGODB_URI,
  connection: 'sessions',
});

app.use(session({ 
  secret: 'my secret',
  resave: false,
  store: store,
  saveUninitialized: false 
}));

/* app.use(csrfProtection);
app.use(flash()); */

app.use((req,res,next) => {
/*   if (!req.session.user) {
    return next();
  }
  User
  .findByPk(req.session.user.id)
  .then((user) => {
    req.user = user;
    next();
  })
  .catch((err) => console.log(err)); */
  next();
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
/* app.use(authRoutes); */

app.use(errorController.get404);

mongoConnect(() => {
  app.listen(3000);
});