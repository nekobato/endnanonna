
'use strict'

#require

cookieParser = require("cookie-parser")
bodyParser = require("body-parser")
express = require("express")
favicon = require("serve-favicon")
logger = require("morgan")
debug = require('debug')('express')
path = require("path")

app = express()

# app config

app.set "views", path.join(__dirname, "views")
app.set "view engine", "jade"
app.set "port", process.env.PORT or 3000


#app.use(favicon(__dirname + '/public/favicon.ico'));
app.use logger("dev")
app.use bodyParser.json()
app.use bodyParser.urlencoded(extended: false)
app.use cookieParser()
app.use express.static(path.join(__dirname, "dist"))
app.use "/", require './routes'


# catch 404 and forward to error handler

app.use (req, res, next) ->
  err = new Error("Not Found")
  err.status = 404
  next err
  return


# error handlers

if app.get("env") is "development"
  app.use (err, req, res, next) ->
    res.status err.status or 500
    res.render "error",
      message: err.message
      error: err

    return


# production error handler

app.use (err, req, res, next) ->
  res.status err.status or 500
  res.render "error",
    message: err.message
    error: {}

  return

module.exports = app
