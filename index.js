#!/usr/bin/env nodejs
var express = require('express');
var logger = require('morgan');
var fs = require('fs');
var uDMX = require('udmx');
var path = require('path');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);


app.use(logger('dev'));
app.use(express.static('public'));

var dmx = new uDMX();
dmx.connect();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  res.render('index', { title: '#Octothorpe Lighting Control' });
});

io.on('connection', function (socket) {
  console.log("Connection from", socket.id, 'total connections', io.engine.clientsCount);
  io.emit('count', io.engine.clientsCount);
  for(var channel in dmx.state) {
    io.emit('update', {channel: channel, value: dmx.get(channel)});
  }

  socket.on('set', function(data) {
    dmx.set(data.channel, data.value).then(() => {
      io.emit('update', data);
    }).catch((e) => {
      socket.emit('failed', data.channel, dmx.get(data.channel) || 0);
      console.error('Failed to update!', e.stack || e);
    });
  });
  socket.on('disconnect', function() {
    console.log("Lost connection from", socket.id, "total connections", io.engine.clientsCount);
    io.emit('count', io.engine.clientsCount);
  });
});


server.listen(5000, () => {console.log('HTTPd started');});

for(var i = 10; i < 512; i += 10) {
  dmx.set(i+1, 255);
}
