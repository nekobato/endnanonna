install:
	npm install
	if [ ! -e tmp ]; then mkdir tmp; fi
	if [ ! -e tmp/no ]; then mkdir tmp/no; fi
	if [ ! -e tmp/moji ]; then mkdir tmp/moji; fi
	coffee -c test.coffee
