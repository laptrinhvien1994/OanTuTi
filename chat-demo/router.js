const express = require('express');
const router = express.Router();

//API URL for Facebook webhook.
router.post('/api/conversation', function(req, res){
    console.log(req.body);
    res.send({type: 'POST'});
});


module.exports = router;
