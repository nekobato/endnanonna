#!/usr/bin/env node

# Module dependencies
express = require 'express'
path = require 'path'
http = require 'http'
os = require 'os'
_ = require 'underscore'

nonnon = require './test.js'

# Express settigns
app = express()

app.set "port", process.env.PORT or 3006
app.set "views", __dirname + "/views"
app.set "view engine", "jade"
app.use express.favicon()
app.use express.logger("dev")
app.use express.compress()
app.use express.bodyParser()
app.use express.methodOverride()
app.use app.router
app.use express.static(path.join(__dirname, "dist"))
app.use express.errorHandler()  if "development" is app.get("env")
app.disable 'x-powered-by'

# Routes & APIs

app.get "/", (req, res) ->
	res.render 'index'

app.get "/create", (req, res) ->
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

# Start server
http.createServer(app).listen app.get("port"), ->
	console.log "End-nanon listening on port " + app.get("port")