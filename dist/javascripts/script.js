(function() {
  var extract, gitcmd, history, socket;

  history = [];

  extract = function(data, branch) {
    data.match(/^(.+),(.+),(.+),(.+)/);
    return {
      branch: branch,
      hash: RegExp.$1,
      author: RegExp.$2,
      date: RegExp.$3.match(/^(.+) (.+) (.+)/),
      msg: RegExp.$4
    };
  };

  socket = io.connect('//localhost:3006');

  socket.on('quake', function(d) {
    var commit, h, log, _i, _j, _len, _len1, _ref;
    _ref = d.log;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      log = _ref[_i];
      commit = extract(log);
      commit.branch = d.name;
      console.log(commit);
      for (_j = 0, _len1 = history.length; _j < _len1; _j++) {
        h = history[_j];
        if (commit.hash === h.history) {
          history[h.indexOf(commit.hash)].branch[commit.branch] = true;
        }
      }
    }
    return console.log(history);
  });

  socket.on('uplift', function(data) {
    var commit, commits, info, line, _i, _j, _len, _len1, _ref, _results;
    console.log(data);
    $('.quakearea').append(_.template($('#quakeplate-template').text(), data));
    commits = [];
    _ref = data.log;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      info = geninfo(line, data.name);
      commits.push(info);
    }
    commits = _.sortBy(commits, function(i) {
      return i.date[0];
    });
    _results = [];
    for (_j = 0, _len1 = commits.length; _j < _len1; _j++) {
      commit = commits[_j];
      if (hashs.indexOf(commit.hash) > -1) {
        commit.num = hashs.indexOf(info.hash) + 1;
        _results.push($('.quakeplate.' + commit.branch).append(_.template($('#quakemsg-template').text(), commit)));
      } else {
        commit.num = hashs.length + 1;
        _results.push($('.quakeplate.' + info.branch).append(_.template($('#quakemsg-template').text(), commit)));
      }
    }
    return _results;
  });

  socket.on('log', function(data) {
    var backhash, commit, commits, info, line, num, _i, _j, _len, _len1, _ref;
    console.log(data);
    commits = [];
    $('.quakearea').append(_.template($('#quakeplate-template').text(), data));
    _ref = data.log;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      line = _ref[_i];
      info = geninfo(line, data.name);
      commits.push(info);
    }
    commits = _.sortBy(commits, function(i) {
      return i.date[0];
    });
    num = 0;
    for (_j = 0, _len1 = commits.length; _j < _len1; _j++) {
      commit = commits[_j];
      if (commit.hash !== backhash) {
        hashs.push(commit.hash);
        num++;
      }
      commit.num = num;
      $('.quakeplate.' + commit.branch).append(_.template($('#quakemsg-template').text(), commit));
      backhash = commit.hash;
    }
    return this;
  });

  socket.on('connect', function() {
    console.log('conection start');
    return socket.emit('log', {});
  });

  gitcmd = {
    branch: function(callback) {
      return $.ajax({
        url: '/branch',
        dataType: 'json'
      }.done(function(data) {
        return callback(data);
      }));
    },
    show: function(hash, callback) {
      return $.ajax({
        url: "/commit/{#hash}",
        dataType: 'json'
      }.done(function(data) {
        return callback(data);
      }));
    },
    log: function(hash, callback) {
      return $.ajax({
        url: "/log/" + branch,
        dataType: 'json'
      }.done(function(data) {
        return callback(data);
      }));
    }
  };

  $(document).load(function() {
    return gitcmd.branch;
  });

}).call(this);

/*
//@ sourceMappingURL=script.js.map
*/