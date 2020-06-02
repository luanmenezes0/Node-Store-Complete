const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();
const store = new SequelizeStore({
  db: sequelize
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
  secret: 'my secret', 
  resave: false,
  store: store,
  saveUninitialized: false 
}));

app.use(csrfProtection);
app.use(flash());

app.use((req,res,next) => {
  if (!req.session.user) {
    return next();
  }
  User
  .findByPk(req.session.user.id)
  .then((user) => {
    req.user = user;
    next();
  })
  .catch((err) => console.log(err));
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

/* sequelize
  .sync({ })
  .then((result) => {
    return User.findByPk(1);
  
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: 'Max', email: 'test@test.com' })
    }
    return user;
  })
  .then((user) => {
  
    return user.createCart();
  }).then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  }); */


  sequelize
  .sync( {  })
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });