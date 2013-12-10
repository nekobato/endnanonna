#!/usr/bin/env node

process.env.ROOT_DIR = ''
process.env.BASE_URL = ''

# Module dependencies
express = require 'express'
path = require 'path'
http = require 'http'
c_p = require 'child_process'
im = require 'imagemagick'
os = require 'os'
_ = require 'underscore'

# Express settigns
app = express()

app.set "port", process.env.PORT or 3006
app.set "views", __dirname + "/views"
app.set "view engine", "jade"
app.use express.favicon()
app.use express.logger("dev")
app.use express.bodyParser()
app.use express.methodOverride()
app.use app.router
app.use express.static(path.join(__dirname, "dist"))
app.use express.errorHandler()  if "development" is app.get("env")

# Routes & APIs

app.get "/", (req, res) ->
	res.render 'index'

app.get "/create/:query", (req, res) ->
	#TBD

# Start server
http.createServer(app).listen app.get("port"), ->
	console.log "End-nanon listening on port " + app.get("port")
