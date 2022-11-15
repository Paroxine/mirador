const express = require('express');
const session = require('express-session');
const url = require('url');
const router = express.Router();
/* const mongodb = require('mongodb');

const mongo = mongodb.MongoClient;

mongo.connect('mongodb://147.250.35.86:27017/robots', function(err, client) {
    if (err) throw err;
    var robots = client.db('robots');
    client.close();
}); */

router.use(
    session({
        secret: 'mirador',
        resave: false,
        saveUninitialized: true
    })
);

router.get('/', (req, res) => {
    res.redirect(
        url.format({
            pathname: '/login',
            query: req.query
        })
    )
});

router.get('/login', (req, res) => {
    if (Object.keys(req.query).length !== 0) {
        res.render('login', req.query);
    }
    else if (req.session) {
        res.render('login', {robot_class: req.session.robot_class, name: req.session.name, address: req.session.address, port: req.session.port, color: req.session.color});
    }
    else {
        res.render('login');
    }
});

router.get('/logout', (req, res) => {
    res.redirect(
        url.format({
            pathname: '/login',
            query: req.query
        })
    );
});

router.post('/login', (req, res) => {
    req.session.robot_class = req.body.robot_class;
    req.session.name = req.body.name;
    req.session.address = req.body.address;
    req.session.port = req.body.port;
    req.session.color = req.body.color;
    res.redirect(
        url.format({
            pathname: '/robot',
            query: req.body
        })
    );
});

router.get('/robot', (req, res) => {
    if (req.query.robot_class && req.query.name && req.query.address && req.query.port && req.query.color) {
        res.render('robot', req.query);
    }
    else {
        res.redirect(
            url.format({
                pathname: '/login',
                query: req.query
            })
        );
    }
});

router.get('/broadcast', (req, res) => {
    res.render('broadcast');
});

module.exports = router;