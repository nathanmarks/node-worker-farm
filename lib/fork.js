const childProcess = require('child_process')
    , childModule  = require.resolve('./child/index')


var debugPortOffset = 1;

function fork (forkModule) {
  var execArgv = process.execArgv.slice()
    , debugPort = 0

  for (var i = 0; i < execArgv.length; i++) {
    var match = execArgv[i].match(
      /^(--inspect|--debug|--debug-(brk|port))(=\d+)?$/
    )

    if (match) {
      if (debugPort === 0) {
        debugPort = process.debugPort + debugPortOffset
        ;++debugPortOffset
      }

      execArgv[i] = match[1] + '=' + debugPort
    }
  }

  var child = childProcess.fork(childModule, {
          env: process.env
        , cwd: process.cwd()
        , execArgv: execArgv
      })

  child.send({ module: forkModule })

  // return a send() function for this child
  return {
      send  : function (data) {
        try {
          child.send(data)
        } catch (e) {
          // this *should* be picked up by onExit and the operation requeued
        }
      }
    , child : child
  }
}

module.exports = fork