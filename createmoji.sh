#!/bin/bash
IFS=',' read -ra arr <<< $1
i=0
for moji in $arr
do
  convert \
    -background none \
    -font "./vendor/rounded-x-mplus-1p-black.ttf" \
    -pointsize 80 \
    -fill blue \
    label:"${moji}" \
    -rotate 10 \
    "${2}${i}.png"
  let i=$i+1
done