const express = require('express');
const router = express.Router();

const nonnon = require('./nonnon');

router.get('/', (req, res) => res.render('index'));

router.get('/create', function(req, res) {
  const error_message = '日本語７文字以外は受け付けません';

  if (!req.query.string) {
    return res.status(400).send(error_message);
  }

  const str = decodeURIComponent(req.query.string);

  if (str.match(/^([^\x01-\x7E]{7})$/)) {
    if (str.match(/^([^\x01-\x7E]{8})/)) {
      return res.status(400).send(error_message);
    }
    return nonnon.run(str, { mini: req.query.mini != null }, id =>
      res.status(200).send(id)
    );
  } else {
    return res.status(400).send(error_message);
  }
});

module.exports = router;
