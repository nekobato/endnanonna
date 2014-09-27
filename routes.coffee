express = require('express')
router = express.Router()

nonnon = require("./test")

router.get "/", (req, res) ->
  res.render 'index'

router.get "/create", (req, res) ->
  if not req.query.string
    return res.send 'error'

  str = req.query.string

  if str.match /^([^\x01-\x7E]{7})/
    if str.match /^([^\x01-\x7E]{8})/
      return res.send {result: 'error', msg: '日本語７文字制限あります'}
    nonnon.run str, (id) ->
      return res.send {result: 'success', id: id}
  else
    return res.send {result: 'error', msg: '日本語７文字制限あります'}


module.exports = router
