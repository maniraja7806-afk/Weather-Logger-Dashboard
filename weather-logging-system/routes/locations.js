const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
    try {
        const locations = await Location.find({ userId: req.user.id });
        res.json(locations);
    } catch (err) { next(err); }
});

router.post('/', auth, async (req, res, next) => {
    try {
        const newLoc = new Location({ ...req.body, userId: req.user.id });
        await newLoc.save();
        res.json(newLoc);
    } catch (err) { next(err); }
});
module.exports = router;