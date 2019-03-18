/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs-extra');
const sh = require('child_process').execSync;

const FONT_FILE = './vendor/rounded-x-mplus-1m-bold.ttf';
const NO_DIR = './vendor/no';
const OUT_DIR = './dist/out';

// magic numbers
const mojiConfig = {};
mojiConfig.size = [80, 64, 78, 54, 54, 64, 68];
mojiConfig.rotate = [-12, -2, -10, -10, -10, -10, 10];
mojiConfig.geo = [
  '+0+0',
  '+70+10',
  '+120+0',
  '+180+0',
  '+230+0',
  '+280+0',
  '+335+0'
];
mojiConfig.fill = [
  '#dd188b',
  '#dd188b',
  '#f57315',
  '#5ac02e',
  '#5ac02e',
  '#12a7c5',
  '#12a7c5'
];

const heights = [
  6,
  6,
  15,
  24,
  24,
  61,
  81,
  93,
  93,
  95,
  109,
  119,
  123,
  123,
  133,
  134,
  135,
  135
];

const create = function(height, file) {
  if (file == null) {
    file = 124;
  }
  const geo = `+0+${74 - height / 2}`;
  const top = `x${height}!`;
  return console.log(`${file} is ${done}`);
};

const image = {
  moji(obj, out) {
    // obj = label pointsize fill rotate file
    return sh(
      'convert' +
        ' -background none' +
        ` -font ${FONT_FILE}` +
        ` -pointsize ${obj.pointsize}` +
        ` -fill '${obj.fill}'` +
        ` -stroke '${obj.fill}'` +
        ' -strokewidth 2' +
        ` label:${obj.label}` +
        ' -trim' +
        ` -rotate ${obj.rotate}` +
        ` ${out}`
    );
  },

  expand(src, out, height) {
    return sh(
      'convert' + ` -geometry x${height}!` + ` ${src}` + ' -trim' + ` ${out}`
    );
  },

  ground(src, out, splice) {
    return sh(
      'convert -background none -gravity east' +
        ` -splice ${splice}x` +
        ` ${src}` +
        ` ${out}`
    );
  },

  append(src, out, geo) {
    return sh(
      `convert ${out} ${src}` +
        ` -gravity southwest -geometry ${geo}` +
        ` -composite ${out}`
    );
  },

  compo(src, moji, height, out) {
    const geo = `+5+${72 - height / 2}`;

    return sh(
      'convert' +
        ` ${src}` +
        ` ${moji}` +
        ' -gravity center' +
        ` -geometry ${geo}` +
        ` -composite ${out}`
    );
  },

  toGif(dir, out, option) {
    let option_mini;
    if (option.mini != null) {
      option_mini = '--resize 340x200 --colors 100';
    } else {
      option_mini = '';
    }
    // gifは15fpsで用意してあるので、およそdelay=7で一応対応
    console.log(option);
    return sh(
      'gifsicle' +
        ' --delay=7 ' +
        `./vendor/no.gif ${dir}/*.gif ` +
        `${option_mini}` +
        ` > ${out}`
    );
  }
};

// ランダムにID (server.coffeeに移動する予定)
const randomId = function(len) {
  const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const a = str.split('');
  let res = '';
  for (
    let n = 1, end = len, asc = 1 <= end;
    asc ? n <= end : n >= end;
    asc ? n++ : n--
  ) {
    res += a[Math.floor(Math.random() * a.length)];
  }
  return res;
};

// Script start
module.exports = {
  // main flow
  run(str, option, callback) {
    // moji config
    let asc, end, j;
    let i;
    mojiConfig.moji = str.split('');
    // create id
    const id = randomId(8);
    // dirconfig
    const tmpMojiDir = `./tmp/moji/${id}`;
    const tmpNoDir = `./tmp/no/${id}`;
    // make temporary directory
    fs.ensureDirSync(tmpMojiDir);
    fs.ensureDirSync(tmpNoDir);
    // set splice (first str + each str = moji image width)
    let splice = 0;
    for (let s of Array.from(mojiConfig.size)) {
      splice += s - Math.floor(s / 10);
    }
    // create each moji
    for (
      j = 0, i = j, end = mojiConfig.moji.length - 1, asc = 0 <= end;
      asc ? j <= end : j >= end;
      asc ? j++ : j--, i = j
    ) {
      image.moji(
        {
          pointsize: mojiConfig.size[i],
          fill: mojiConfig.fill[i],
          label: mojiConfig.moji[i],
          rotate: mojiConfig.rotate[i]
        },
        `${tmpMojiDir}/${i}.png`
      );
      if (
        i === 0 ||
        i === mojiConfig.moji.length - 2 ||
        i === mojiConfig.moji.length - 1
      ) {
        image.expand(
          `${tmpMojiDir}/${i}.png`,
          `${tmpMojiDir}/${i}.png`,
          Math.floor(mojiConfig.size[i] * 1.6)
        );
      }
      if (i === 0) {
        image.ground(
          `${tmpMojiDir}/${i}.png`,
          `${tmpMojiDir}/base.png`,
          splice
        );
      } else {
        image.append(
          `${tmpMojiDir}/${i}.png`,
          `${tmpMojiDir}/base.png`,
          mojiConfig.geo[i]
        );
      }
    }
    // composition
    return fs.readdir('./vendor/no', function(err, files) {
      i = 0;
      for (let file of Array.from(files)) {
        if (file.match(/^nonnon([0-9]+)\.gif/)) {
          const num = RegExp.$1;
          // magic number of the movie timeline
          // 107 ~ 123 107から文字が出始める
          // 124 ~ 200 124から文字サイズ固定
          if (124 > num && num > 106) {
            image.expand(
              `${tmpMojiDir}/base.png`,
              `${tmpMojiDir}/out.png`,
              heights[i]
            );
            image.compo(
              `${NO_DIR}/${file}`,
              `${tmpMojiDir}/out.png`,
              heights[i],
              `${tmpNoDir}/nonnon${num}.gif`
            );
            i++;
          } else if (num >= 124) {
            image.compo(
              `${NO_DIR}/${file}`,
              `${tmpMojiDir}/out.png`,
              heights[i],
              `${tmpNoDir}/nonnon${num}.gif`
            );
          }
        }
      }
      // create animated gif
      image.toGif(tmpNoDir, `${OUT_DIR}/${id}.gif`, option);

      console.log(`created: ${id}`);
      // callback
      return callback(id);
    });
  }
};
