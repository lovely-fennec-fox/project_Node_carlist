const express = require('express');
const path = require('path');
const router = express.Router();

router.use(express.urlencoded({
    extended: false
})); 
router.use(express.static(path.join('', 'public'))); 



router.get('/profile', (req, res) => {
    res.render('./profile.html');
})


module.exports = router;  //  module.exports 다른 페이지에서 쓸 수 있도록 넘겨주는 명령어 