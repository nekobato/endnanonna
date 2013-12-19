fs = require 'fs'
cp = require 'child_process'

fs.readdir '../vendor/nonnons', (err, files) ->
	for file in files
		strs = file.split '.'
		cp.exec "convert ../vendor/nonnons/#{file} ../vendor/no/#{strs[0]}.gif"
