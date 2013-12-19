fs = require 'fs'
c_p = require 'child_process'
sh = require 'execSync'

FONT_FILE = "./vendor/rounded-x-mplus-1m-bold.ttf"
NO_DIR    = './vendor/no'
OUT_DIR   = './dist/out'

# magic numbers
mojiConfig = {}
mojiConfig.size = [80, 64, 78, 54, 54, 64, 78]
mojiConfig.rotate = [-12, -2, -10, -10, -10, -10, 12]
mojiConfig.geo = ['+0+0', '+70+10', '+120+0', '+180+0', '+230+0', '+280+0', '+335+0']
mojiConfig.fill = ['#dd188b', '#dd188b', '#f57315', '#5ac02e', '#5ac02e', '#12a7c5', '#12a7c5']

heights = [6, 6, 15, 24, 24, 61, 81, 93, 93, 95, 109, 119, 123, 123, 133, 134, 135, 135]


create = (height, file = 124) ->
	geo = '+0+' + (74 - height/2)
	top = "x#{height}!"
	console.log "#{file} is #{done}"


image =
	moji: (obj, out) ->
		#	obj = label pointsize fill rotate file
		sh.run "convert" +
			" -background none" +
			" -font #{FONT_FILE}" +
			" -pointsize #{obj.pointsize}" +
			" -fill '#{obj.fill}'" +
			" -stroke '#{obj.fill}'" +
			" -strokewidth 2" +
			" label:#{obj.label}" +
			" -trim" +
			" -rotate #{obj.rotate}" +
			" #{out}"


	expand: (src, out, height) ->

		sh.run "convert" +
			" -geometry x#{height}!" +
			" #{src}" +
			" -trim" +
			" #{out}"

	ground: (src, out, splice) ->
		sh.run "convert -background none -gravity east" +
			" -splice #{splice}x" +
			" #{src}" +
			" #{out}"

	append: (src, out, geo) ->
		sh.run "convert #{out} #{src}" +
			" -gravity southwest -geometry #{geo}" +
			" -composite #{out}"

	compo: (src, moji, height, out) ->

		geo = '+5+' + (72 - height/2)

		sh.run "convert" +
			" #{src}" +
			" #{moji}" +
			" -gravity center" +
			" -geometry #{geo}" +
			" -composite #{out}"


	toGif: (dir, out) ->
		# gifは15fpsで用意してあるので、およそdelay=7で一応対応
		sh.run "gifsicle" +
			" --delay=7" +
			" ./vendor/no.gif #{dir}/*.gif" +
			" > #{out}"

# ランダムにID (server.coffeeに移動する予定)
randomId = (len) ->

	str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	a = str.split ''
	res = ''
	for n in [1..len]
		res += a[Math.floor(Math.random() * a.length)]
	res

# Script start
module.exports =
	# main flow
	run: (str, callback) ->
		# moji -> config
		mojiConfig.moji = str.split ''

		# create id
		id = randomId 8

		# dirconfig
		tmpMojiDir = "./tmp/moji/#{id}"
		tmpNoDir   = "./tmp/no/#{id}"
		
		# make temporary directory
		fs.mkdirSync tmpMojiDir
		fs.mkdirSync tmpNoDir

		# set splice (first str + each str = moji image width)
		splice = 0
		splice += s - Math.floor(s / 10) for s in mojiConfig.size

		# create each moji
		for i in [0..mojiConfig.moji.length-1]

			image.moji {
				pointsize: mojiConfig.size[i]
				fill: mojiConfig.fill[i],
				label: mojiConfig.moji[i],
				rotate: mojiConfig.rotate[i]
			}, "#{tmpMojiDir}/#{i}.png"

			if i is 0 or i is mojiConfig.moji.length-2 or i is mojiConfig.moji.length-1
				image.expand "#{tmpMojiDir}/#{i}.png", "#{tmpMojiDir}/#{i}.png", Math.floor(mojiConfig.size[i] * 1.6)
				console.log "#{i} is expanded"
			if i is 0
				image.ground "#{tmpMojiDir}/#{i}.png", "#{tmpMojiDir}/base.png", splice
				console.log "#{i} is ground"
			else
				image.append "#{tmpMojiDir}/#{i}.png", "#{tmpMojiDir}/base.png", mojiConfig.geo[i]
				console.log "#{i} is appended"

		fs.readdir './vendor/no', (err, files) ->
			i = 0
			for file in files when file.match /^nonnon([0-9]+)\.gif/
				console.log file
				num = RegExp.$1
				# magic number of the movie timeline
				# 107 ~ 123 107から文字が出始める
				# 124 ~ 200 124から文字サイズ固定
				if 124 > num > 106
					image.expand "#{tmpMojiDir}/base.png", "#{tmpMojiDir}/out.png", heights[i]
					image.compo "#{NO_DIR}/#{file}", "#{tmpMojiDir}/out.png", heights[i], "#{tmpNoDir}/nonnon#{num}.gif"
					i++
				else if num >= 124
					image.compo "#{NO_DIR}/#{file}", "#{tmpMojiDir}/out.png", heights[i], "#{tmpNoDir}/nonnon#{num}.gif"
			image.toGif(tmpNoDir, "#{OUT_DIR}/#{id}.gif")
			console.log id
			callback id
	