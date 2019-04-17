var express = require("express");
var router = express.Router();
var lightning = require("lightning-client");
var config = require("../config");
var lightningPath = config.lightningPath;
var _lightning = new lightning(lightningPath, true);

router.get("/", (req, res, next) => {
    res.render("index", {
        title: "Ashvin's Lightning Node ⚡️",
        availableBalance: 0
    });
})

module.exports = router;