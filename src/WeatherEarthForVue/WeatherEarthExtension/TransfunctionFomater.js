
function TransfunctionFomater(options) {
  const colors = {};
  const alhpas = {};
  this._fastIndex = {};
  this._useRGBA = Cesium.defaultValue(options.useRGBA, false);
  const Transfunctions = options.Transfunctions;
  const valueRamp = Transfunctions.ValueRamp;
  const colorRamp = Transfunctions.ColorRamp;

  let i = 1;
  for (;i < valueRamp.length; i++) {
    const k = `[${valueRamp[i - 1]},${valueRamp[i]}]`;
    const c = colorRamp[i];
    if (this._useRGBA) {
      colors[k] = c;
    } else {
      colors[k] = [c[0], c[1], c[2]];
    }
    alhpas[k] = c[3];
    this._fastIndex[k] = i;
  }

  this._colors = colors;
  this._alhpas = alhpas;

  this._colorChangedEvent = new Cesium.Event();
  this._removeEventSubscription = this._colorChangedEvent.addEventListener(
    TransfunctionFomater.prototype._onChange,
    this
  );
  this._valueRamp = valueRamp;
  this._colorRamp = colorRamp;
}

TransfunctionFomater.prototype._onChange = function (sender, value, color) {
  if (Cesium.defined(this.onChange)) {
    this.onChange(sender, value, color);
  }
};

TransfunctionFomater.prototype.destroy = function () {
  this._removeEventSubscription();
};

Object.defineProperties(TransfunctionFomater.prototype, {
  ValueAndColorRamp: {
    get() {
      return {
        ValueRamp: this._valueRamp,
        ColorRamp: this._colorRamp
      };
    }
  },
  colors: {
    get() {
      return this._colors;
    }
  },
  alhpas: {
    get() {
      return this._alhpas;
    }
  },
  colorRamp: {
    set(options) {
      const { value, color } = options;
      const i = this._fastIndex[value];
      const r = parseInt(color[0], 10);
      const g = parseInt(color[1], 10);
      const b = parseInt(color[2], 10);
      const a = parseInt(this._alhpas[value], 10);
      const c = this._useRGBA ? [r, g, b, a] : [r, g, b];
      const d = this._colorRamp[i];
      if (d[0] !== c[0] || d[1] !== c[1] || d[2] !== c[2] || d[3] !== c[3]) { 
        this.colors[value] = c; 
        this._colorRamp[i] = [r, g, b, a];
        this._colorChangedEvent.raiseEvent(this, value, c, '');
      }
    }
  },
  colorAlpha: {
    set(options) {
      const { value, alpha } = options;
      const i = this._fastIndex[value];
      const c = this.colors[value]; 
      const a = parseInt(alpha, 10);
      const b = parseInt(c[3], 10);
      if (b !== a) { 
        this.colors[value][3] = a; 
        this._colorRamp[i][3] = a; 
        this._colorChangedEvent.raiseEvent(this, value, c, '');
      }
    }
  }
});


export default TransfunctionFomater;
