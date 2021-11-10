const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

//méthode asynchrone
exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        console.log(user);
        user.save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
};

//si utilisateur n'existe pas, renvoie une erreur
exports.login = (req, res, next) => {
    User.findOne({ where:{email: req.body.email} })
      .then(user => {
        if (!user) {
          return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        }
        console.log("user: ", user)
        bcrypt.compare(req.body.password, user.password)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Mot de passe incorrect !' });
            }
            console.log("is valid: ", valid)
            console.log("User id: ", user.id)
            res.status(200).json({
              userId: user.id,
              token: jwt.sign(
                { userId: user.id },
                // { userId: "testid" },
                'RANDOM_TOKEN_SECRET', 
                { expiresIn: '24h' }
              )
            });
          })
          .catch(error => {
            console.log(error);
            res.status(500).json({ error })});
      })
      .catch(error => res.status(500).json({ error }));
};