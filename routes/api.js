var express = require("express");
var router = express.Router();
var lightning = require("lightning-client");
var config = require("../config");
var lightningPath = config.lightningPath;
var _lightning = new lightning(lightningPath, true);

router.get("/getinfo", authenticateRequest, function (req, res, next) {
  _lightning
    .getinfo()
    .then(info => {
      res.json({ status: "success", info });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/listpayments", authenticateRequest, function (req, res, next) {
  _lightning
    .listpayments()
    .then(result => {
      res.json({ status: "success", payments: result.payments });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/listpeers", authenticateRequest, function (req, res, next) {
  _lightning
    .listpeers()
    .then(result => {
      res.json({ status: "success", peers: result.peers });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/listfunds", authenticateRequest, function (req, res, next) {
  _lightning
    .listfunds()
    .then(result => {
      res.json({ status: "success", funds: result });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/invoice", authenticateRequest, function (req, res, next) {
  var satoshis = req.query.satoshis;
  var label = req.query.label;
  var description = req.query.description;
  if (!satoshis || !label || !description) {
    res.send(404);
    return;
  }
  //satoshis to msatoshis
  _lightning
    .invoice(satoshis * 1000, label, description, 3600)
    .then(invoice => {
      res.json({ status: "success", invoice });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/fundchannel", authenticateRequest, function (req, res, next) {
  var nodeId = req.query.nodeId;
  var satoshis = req.query.satoshis;
  if (!nodeId || !satoshis) {
    res.send(404);
    return;
  }
  _lightning
    .fundchannel(nodeId, satoshis)
    .then(result => {
      res.json({ status: "success", result });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/decodepay", authenticateRequest, function (req, res, next) {
  var bolt11 = req.query.bolt11;
  if (!bolt11) {
    res.send(404);
    return;
  }
  _lightning
    .decodepay(bolt11)
    .then(invoice => {
      res.json({ status: "success", invoice });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/pay", authenticateRequest, function (req, res, next) {
  var bolt11 = req.query.bolt11.replace("lightning:", "");
  if (!bolt11) {
    res.send(404);
    return;
  }
  _lightning
    .pay(bolt11)
    .then(invoice => {
      res.json({ status: "success", invoice });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/listinvoices", authenticateRequest, function (req, res, next) {
  var label = req.query.label;
  if (!label) {
    res.send(404);
    return;
  }
  _lightning
    .listinvoices(label)
    .then(result => {
      res.json({ status: "success", result });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/delexpiredinvoice", authenticateRequest, function (req, res, next) {
  _lightning
    .delexpiredinvoice()
    .then(result => {
      res.json({ status: "success", result });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/closechannel", authenticateRequest, function (req, res, next) {
  let channelId = req.query.channelId;
  if (!channelId) {
    res.send(404);
    return;
  }
  _lightning
    .close(channelId)
    .then(result => {
      res.json({
        status: "success",
        message: `Closed Channel ${channelId}`,
        result
      });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/newaddr", authenticateRequest, function (req, res, next) {
  _lightning
    .newaddr()
    .then(result => {
      res.json({ status: "success", address: result.address });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/listnodes", authenticateRequest, function (req, res, next) {
  var nodeId = req.query.nodeId ? req.query.nodeId : undefined;

  _lightning
    .listnodes(nodeId)
    .then(result => {
      res.json({ status: "success", result });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

router.get("/connect", authenticateRequest, function (req, res, next) {
  var node = req.query.node;
  if (!node) {
    res.send(404);
    return;
  }
  _lightning
    .connect(node)
    .then(result => {
      res.json({ status: "success", result });
    })
    .catch(errorResult => {
      res.status(400).json({ status: "error", error: errorResult.error });
    });
});

async function authenticateRequest(req, res, next) {
  if (!req.query.authed) {
    return errorBadAuth(res);
  }
  next();
}

function errorBadAuth(res) {
  return res.send({
    error: true,
    code: 1,
    message: 'bad auth',
  });
}

module.exports = router;
