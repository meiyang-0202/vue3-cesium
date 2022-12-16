const sizeOfUint32 = Uint32Array.BYTES_PER_ELEMENT;

function PntsSet(options) {
  const { url } = options;
  this._readyPromise = Cesium.defer();
  const that = this;
  Cesium.Resource.fetchArrayBuffer(url).then((arrayBuffer) => {
    that.parse(options, arrayBuffer);
    that._readyPromise.resolve(this);
  });
}

Object.defineProperties(PntsSet.prototype, {
  readyPromise: {
    get() {
      return this._readyPromise.promise;
    },
  },
});

PntsSet.prototype.parse = function (options, arrayBuffer) {
  let byteOffset = Cesium.defaultValue(options.byteOffset, 0);

  const uint8Array = new Uint8Array(arrayBuffer);
  const view = new DataView(arrayBuffer);
  byteOffset += sizeOfUint32; // Skip magic
  const version = view.getUint32(byteOffset, true);
  if (version !== 1) {
    throw new Cesium.RuntimeError(
      'Only Point Cloud tile version 1 is supported.  Version '
                + version
                + ' is not.'
    );
  }
  byteOffset += sizeOfUint32;

  // Skip byteLength
  byteOffset += sizeOfUint32;
    
  const featureTableJsonByteLength = view.getUint32(byteOffset, true);
  if (featureTableJsonByteLength === 0) {
    throw new Cesium.RuntimeError(
      'Feature table must have a byte length greater than zero'
    );
  }
  byteOffset += sizeOfUint32;
  const featureTableBinaryByteLength = view.getUint32(byteOffset, true);
  byteOffset += sizeOfUint32;
  const batchTableJsonByteLength = view.getUint32(byteOffset, true);
  byteOffset += sizeOfUint32;
  const batchTableBinaryByteLength = view.getUint32(byteOffset, true);
  byteOffset += sizeOfUint32;
  const featureTableString = Cesium.getStringFromTypedArray(
    uint8Array,
    byteOffset,
    featureTableJsonByteLength
  );
  const featureTableJson = JSON.parse(featureTableString);
  byteOffset += featureTableJsonByteLength;

  const featureTableBinary = new Uint8Array(
    arrayBuffer,
    byteOffset,
    featureTableBinaryByteLength
  );
  byteOffset += featureTableBinaryByteLength;

  // Get the batch table JSON and binary
  let batchTableJson;
  let batchTableBinary;
  if (batchTableJsonByteLength > 0) {
    // Has a batch table JSON
    const batchTableString = Cesium.getStringFromTypedArray(
      uint8Array,
      byteOffset,
      batchTableJsonByteLength
    );
    batchTableJson = JSON.parse(batchTableString);
    byteOffset += batchTableJsonByteLength;

    if (batchTableBinaryByteLength > 0) {
      // Has a batch table binary
      batchTableBinary = new Uint8Array(
        arrayBuffer,
        byteOffset,
        batchTableBinaryByteLength
      );
      byteOffset += batchTableBinaryByteLength;
    }
  }

  const featureTable = this._featureTable = new Cesium.Cesium3DTileFeatureTable(
    featureTableJson,
    featureTableBinary
  );
        
  const pointsLength = featureTable.getGlobalProperty('POINTS_LENGTH');
  featureTable.featuresLength = pointsLength;

  let batchIds;
  let batchTable;

  const positions = featureTable.getPropertyArray(
    'POSITION',
    Cesium.ComponentDatatype.FLOAT,
    3
  );

  let hasBatchIds = false;
  if (!hasBatchIds) {
    if (Cesium.defined(featureTableJson.BATCH_ID)) {
      batchIds = featureTable.getPropertyArray(
        'BATCH_ID',
        Cesium.ComponentDatatype.UNSIGNED_SHORT,
        1
      );
      hasBatchIds = true;
    }
  }

  if (hasBatchIds) {
    const batchLength = featureTable.getGlobalProperty('BATCH_LENGTH');
    if (!Cesium.defined(batchLength)) {
      throw new Cesium.RuntimeError(
        'Global property: BATCH_LENGTH must be defined when BATCH_ID is defined.'
      );
    }
        
    if (Cesium.defined(batchTableBinary)) {
      // Copy the batchTableBinary section and let the underlying ArrayBuffer be freed
      batchTableBinary = new Uint8Array(batchTableBinary);
    }
    this.tileset = {};
    this._batchtable = batchTable = new Cesium.Cesium3DTileBatchTable(
      this,
      batchLength,
      batchTableJson,
      batchTableBinary
    );
  }
};

Object.defineProperties(PntsSet.prototype, {
  batchtable: {
    get() {
      return this._batchtable;
    }
  },
  featureTable: {
    get() {
      return this._featureTable;
    }
  },
  pointsLength: {
    get() {
      return Cesium.defined(this._featureTable) 
        ? this._featureTable.getGlobalProperty('POINTS_LENGTH') 
        : 0;
    }
  },
  positions: {
    get() {
      return Cesium.defined(this._featureTable) 
        ? this._featureTable.getPropertyArray('POSITION',
          Cesium.ComponentDatatype.FLOAT,
          3) 
        : undefined;
    }
  }
});
  
export default PntsSet;
