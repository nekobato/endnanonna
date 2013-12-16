 
fs = require 'fs'
sh = require 'execSync'

# dir & file config
FONT = "./vendor/rounded-x-mplus-1m-bold.ttf"
SRC_DIR = "./vendor/nonnons/"
TMP_M_DIR = './tmp/moji/'
TMP_N_DIR = './tmp/nonnon/'
OUT_DIR = './dist/out/'

# magic numbers
magicNum =
	label:  '今回はここまで'.split ''
	size:   [80, 64, 78, 54, 54, 64, 78]
	rotate: [-12, -2, -10, -10, -10, -10, 10]
	geo:    ['+0+0', '+70+30', '+120+15', '+180+25', '+240+25', '+290+5', '+335+0']
	fill:   ['#dd188b', '#dd188b', '#f57315', '#5ac02e', '#5ac02e', '#12a7c5', '#12a7c5']
	height: [6, 6, 15, 24, 24, 61, 81, 93, 93, 95, 109, 119, 123, 123, 133, 134, 135, 135]

image =
	moji: (obj, i, file) ->
		sh.run "convert" +
			" -background none" +
			" -font #{FONT}" +
			" -size x#{obj.size[i]}"+
			" -fill '#{obj.fill[i]}'" +
			" -stroke '#{obj.fill[i]}'" +
			" -strokewidth 2" +
			" label:#{obj.label[i]}" +
			" -trim"
	#		" -rotate #{obj.rotate[i]}" +
			" #{file}"
###
for i in [0..magicNum.label.length-1]
	tmpMojiFile = "#{TMP_M_DIR}moji_#{i}.png"
	image.moji magicNum, i, tmpMojiFile
###
sh.run "convert" +
	" -background none" +
	" -size 640x130" +
	" ./tmp/moji_base.png"

