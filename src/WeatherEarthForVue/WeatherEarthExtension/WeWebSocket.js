
function WeWebSocket(options) {
  this._sid = Cesium.createGuid();
  this._url = `${options.url}/${this._sid}`;
  this._webSocket = undefined;
  this._isConnecting = false;
  this.connect();
  this._event = new Cesium.Event();
}

Object.defineProperties(WeWebSocket.prototype, {
  sid: {
    get() {
      return this._sid;
    }
  },
  url: {
    get() {
      return this._url;
    }
  },
  isConnecting: {
    get() {
      return this._isConnecting;
    }
  },
  event: {
    get() {
      return this._event;
    }
  }
});

WeWebSocket.prototype.connect = function () {
  const that = this;
  this._webSocket = new WebSocket(this._url);
  this._webSocket.onopen = function (e) {
    that.onopen(e);
  };
  this._webSocket.onclose = function (e) {
    that.onclose(e);
  };
  this._webSocket.onerror = function (e) {
    that.onerror(e);
  };
  this._webSocket.onmessage = function (e) {
    that.onmessage(e);
  };
};

WeWebSocket.prototype.disconnect = function () {
  this._webSocket = this._webSocket && this._webSocket.close();
};

WeWebSocket.prototype.onopen = function (e) {
  this._isConnecting = true;
};

WeWebSocket.prototype.onclose = function (e) {
  this._isConnecting = false;
};

WeWebSocket.prototype.onerror = function (e) {

};

WeWebSocket.prototype.onmessage = function (e) {
  this._event.raiseEvent(e);
};

export default WeWebSocket;
