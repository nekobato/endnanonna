fs = require 'fs'
c_p = require 'child_process'
sh = require 'execSync'

resultFile = './result.png'

FONT_FILE = "./vendor/rounded-x-mplus-1m-bold.ttf"
VENDOR_DIR = './vendor/'
NONNON_DIR = './vendor/nonnons/'
TMP_M_DIR = './tmp/moji/'
TMP_N_DIR = './tmp/nonnon/'
OUTPUT_FILE = './out.gif'

# magic number of the string height
heights = [6, 6, 15, 24, 24, 60, 80, 90, 100, 110, 120, 124, 134, 136, 137, 138, 139, 140]

mojiConfig = {}

mojiConfig.moji = 'のんのんびより'.split ''
# hardcoding sizes 
mojiConfig.size = [80, 64, 78, 64, 64, 64, 78]
mojiConfig.geo = ['+80+5', '+65+30', '+115+15', '+187+25', '+240+25', '+287+5', '+335+0']
# hardcoding colors (mecabでやりたい)
mojiConfig.fill = [
	'#dd188b', '#dd188b'
	'#f57315',
	'#5ac02e', '#5ac02e'
	'#12a7c5', '#12a7c5'
]
# 2文字目は回転なし
# 最後の文字は逆回転
mojiConfig.rotate = [-10, -10, -10, -10, -10, -10, 10]


create = (height, file = 124) ->
	geo = '+0+' + (74 - height/2)
	top = "x#{height}!"
	console.log "#{file} is #{done}"

image =
	moji: (obj) ->
		#	obj = label pointsize fill rotate file
		sh.run "convert" +
			" -background none" +
			" -font #{FONT_FILE}" +
			" -pointsize #{obj.pointsize}" +
			" -fill '#{obj.fill}'" +
			" -stroke '#{obj.fill}'" +
			" -strokewidth 2" +
			" label:#{obj.label}" +
			" -rotate #{obj.rotate}" +
			" #{obj.file}"


	expand: (src, out, height) ->

		sh.run "convert" +
			" -geometry x#{height}!" +
			" #{src}" +
			" #{out}"

	append: (obj, id) ->
		spliceW = 0
		spliceW += s - Math.floor(s / 10) for s in obj.size
		sh.run "convert -background none -gravity east -splice #{spliceW}x" +
			" #{TMP_M_DIR}#{id}_0.png" +
			" #{TMP_M_DIR}#{id}.png"

		for i in [1..obj.moji.length-1]
			sh.run "convert #{TMP_M_DIR}#{id}.png #{TMP_M_DIR}#{id}_#{i}.png" +
				" -gravity west -geometry #{obj.geo[i]}" +
				" -composite #{TMP_M_DIR}#{id}.png"
		#変形を色々すると、余白が生まれるので、切り取る
		sh.run "convert -crop 100%x65-50+25 #{TMP_M_DIR}#{id}.png #{TMP_M_DIR}#{id}.png"


	compo: (src, moji, height, out) ->

		geo = '+60+' + (74 - height/2)

		console.log q = "convert" +
			" #{src}" +
			" #{moji}" +
			" -gravity center" +
			" -geometry #{geo}" +
			" -composite #{out}"
		sh.run q


	toGif: (obj) ->
		# pngは15fpsで用意してあるので、およそdelay=7で一応対応
		sh.run "convert" +
			" -delay 7" +
			" -loop 1" +
			" #{TMP_N_DIR}*.png" +
			" #{OUTPUT_FILE}"


randomId = (len) ->

	str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	a = str.split ''
	res = ''
	for n in [1..len]
		res += a[Math.floor(Math.random() * a.length)]
	res


createMoji = (obj, id) ->

	for i in [0..obj.moji.length-1]

		image.moji {
			pointsize: obj.size[i]
			fill: obj.fill[i],
			label: obj.moji[i],
			rotate: obj.rotate[i],
			file: "#{TMP_M_DIR}#{id}_#{i}.png"}
		if i is 0 or i is obj.moji.length-2 or i is obj.moji.length-1
			image.expand "#{TMP_M_DIR}#{id}_#{i}.png", "#{TMP_M_DIR}#{id}_#{i}.png", Math.floor(obj.size[i] * 2.7)

	image.append obj, id

#id = randomId 8
id = "test" # hardcoding

createMoji mojiConfig, id

fs.readdir './vendor/nonnons', (err, files) ->
	i = 0
	for file in files when not file.match /^\./ # fxxk .DS_Store
		file.match /^nonnon([0-9]+)\.png/
		number = RegExp.$1
		# magic number of the movie timeline
		# 107 ~ 123 107から文字が出始める
		# 124 ~ 200 124から文字サイズ固定
		if 124 > number > 106
			image.expand "#{TMP_M_DIR}#{id}.png", "#{TMP_M_DIR}#{id}_sh.png", heights[i]
			image.compo "#{NONNON_DIR}#{file}", "#{TMP_M_DIR}#{id}_sh.png", heights[i], "#{TMP_N_DIR}nonnon#{number}.png"
			i++
		else if number >= 124
			image.compo "#{NONNON_DIR}#{file}", "#{TMP_M_DIR}#{id}.png", heights[i], "#{TMP_N_DIR}nonnon#{number}.png"

	image.toGif()
	console.log "done";
