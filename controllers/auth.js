const bcrypt = require('bcryptjs');
const sgMail = require('@sendgrid/mail');
const SENDGRID_API_KEY = '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';

const User = require('../models/user');

sgMail.setApiKey(SENDGRID_API_KEY);
 
exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ where: { email: email } })
    .then((user) => {
      if (!user) {
        req.flash('error', 'Invalid email or password!');
        return req.session.save((err) => {
          res.redirect('/login');
        });
      }
      bcrypt.compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect('/');
            })
          }
          res.redirect('/login');
        })
        .catch((err) => {
          console.log(err);
          res.redirect('/login');
        });

    })
    .catch((err) => console.log(err));
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User
    .findOne({ where: { email: email } })
    .then((userDoc) => {
      if (userDoc) {
        req.flash('error', 'E-mail is already registered!')
        return res.session.save((err) => {
          res.redirect('/signup');
        })
      }
      return bcrypt.hash(password, 12)
        .then((hashedpassword) => {
          return User.create({
            email: email,
            password: hashedpassword,
          })
          /*           const user = new User({
                      email: email,
                      password: hashedpassword,
                    });
                    return user.save(); */
        })
        .then((user) => {
          user.createCart();
          res.redirect('/login');
          return sgMail.send({
            to: email,
            from: 'luanmenezes99@gmail.com',  //use the email you used to signup to sendgrid
            subject: 'SignUp succeeded',
            text: 'Node.js',
            html: '<h1> You hace successfully signed up!</h1>',
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  })
};
