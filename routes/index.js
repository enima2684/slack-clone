const express = require('express');
const router  = express.Router();


router.get('/', (req, res, next) => {
  res.render('index');
});

router.get('/login', (req, res, next) =>{
  res.render('login');
});

router.post('/process-login', (req, res, next) => {

  res.send(req.body);
  
});

module.exports = router;