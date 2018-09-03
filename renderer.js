var Terminal = require('xterm').Terminal;
var fit = require('xterm/build/addons/fit/fit');
var os = require('os');
var pty = require('node-pty');

var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
var ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 24,
  cwd: process.env.HOME,
  env: process.env
});

Terminal.applyAddon(fit);
var term = new Terminal({cols: 80, rows: 24});
term.open(document.getElementById('terminal-container'));

function buf() {
  s = '';
  sender = null;
  return (data) => {
    s += data;
    if (!sender) {
      sender = setTimeout(() => {
        term.write(s);
        s = '';
        sender = null;
      }, 30);
    }
  };
}

const send = buf();

ptyProcess.on('data', function(data) {
  term.write(data);
  // send(data);
});
term._core.register(term.addDisposableListener('data', ptyProcess.write.bind(ptyProcess)));
term.on('resize', function(size) {
  ptyProcess.resize(size.cols, size.rows);
});
window.onresize = function() { term.fit(); };
term._core.register(term.addDisposableListener('paste', function (data, ev) {
  term.write(data);
}));
term.on('title', (title) => { document.title = title; });

term.fit();
term.focus();

window.term = term;
window.ptyProcess = ptyProcess;
