express = require('express')
router = express.Router()

nonnon = require("./test")

router.get "/", (req, res) ->
  res.render 'index'

router.get "/create", (req, res) ->

  error_message = '日本語７文字以外は受け付けません'

  if not req.query.string
    return res.status(400).send(error_message)

  str = decodeURIComponent req.query.string

  if str.match /^([^\x01-\x7E]{7})/
    if str.match /^([^\x01-\x7E]{8})/
      return res.status(400).send(error_message)
    nonnon.run str, (id) ->
      return res.status(200).send(id)
  else
    return res.status(400).send(error_message)


module.exports = router
