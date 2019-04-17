var express = require("express");
var router = express.Router();
var lightning = require("lightning-client");
var config = require("../config");
var lightningPath = config.lightningPath;
var _lightning = new lightning(lightningPath, true);

router.get("/", async (req, res, next) => {
    let info = await _lightning.getinfo();
    let connectToNode = info.id + '@' + info.address[0].address + ':' + info.address[0].port;

    let invoices = await _lightning.listinvoices().invoices;
    await res.render("index", {
        title: "Ashvin's Lightning Node ⚡️",
        availableBalance: 0,
        connectToNode,
        ...info,
        ...invoices
    });
});

module.exports = router;