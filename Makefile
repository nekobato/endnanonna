install:
	npm install
	mkdir tmp
	mkdir tmp/no
	mkdir tmp/moji
	coffee -c test.coffee
