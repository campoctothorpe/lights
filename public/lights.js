function update(data) {
  console.log("update from the server!", data);
  var elms = document.querySelectorAll('input[name="channel-' + data.channel + '"]');
  for(var i = 0; i < elms.length; i++) {
    if(elms[i].type == "checkbox") {
      elms[i].checked = data.value == 255;
    } else if(elms[i].type == "radio") {
      elms[i].checked = data.value == elms[i].value;
    } else {
      elms[i].value = data.value;
    }
  }
}

function onchange(e) {
  var value = parseInt(this.value);
  if(this.type == "checkbox") {
    value = this.checked ? 255 : 0;
    console.log(this, this.checked, value);
  }
  console.log({channel: parseInt(this.dataset.channel), value: parseInt(value)});
  socket.emit('set', {channel: parseInt(this.dataset.channel), value: parseInt(value)});
}

function onfailed(channel, value) {
  console.log("Failed to update! Setting channel", channel, "to", value);
  update({channel: channel, value: value});
}

function oncount(count) {
  document.querySelector('.clientCount').innerText = count;
}

function init() {
  var socketiojs = document.createElement('script');
  socketiojs.addEventListener('load', socketioinit);
  socketiojs.setAttribute('type', 'text/javascript');
  socketiojs.setAttribute('src', '/socket.io/socket.io.js');
  document.body.appendChild(socketiojs);

  var sliders = document.querySelectorAll('input');

  for(var i = 0; i < sliders.length; i++) {
    sliders[i].addEventListener('change', onchange);
  }
}

function socketioinit() {
  window.socket = io.connect();
  socket.on('update', update);
  socket.on('failed', onfailed);
  socket.on('count', oncount);
}

(function() {init();})();
