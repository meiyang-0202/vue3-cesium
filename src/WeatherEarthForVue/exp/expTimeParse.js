
export function parseNameFunc1(file) {
  const name = file.split('_');
  const iso8601String = name[1].substring(0, 8) + 'T' + name[1].substring(8, 15);
  const t = Cesium.JulianDate.fromIso8601(iso8601String);
  return t;
}

export function parseNameFunc2(file) {
  const name = file.split('_');
  const iso8601String = name[3] + 'T' + name[4];
  const t = Cesium.JulianDate.fromIso8601(iso8601String);
  return t;
}

export function parseNameFunc3(file) {
  const name = file.split('_')[3];
  const iso8601String = name.substr(0, 8) + 'T' + name.substr(8, 6);
  return Cesium.JulianDate.fromIso8601(iso8601String);
}

// Z_RADR_I_Z9571_20190810173900_O_DOR_SA_CAP.bin.bz2
export function parseNameFunc4(file) {
  const name = file.split('_')[4];
  const iso8601String = name.substr(0, 8) + 'T' + name.substr(8, 6);
  return Cesium.JulianDate.fromIso8601(iso8601String);
}

// Z_RADR_I_Z9571_20190810173900_O_DOR_SA_CAP.bin.bz2
export function parseNameFunc4Multiply8(file) {
  const name = file.split('_')[4];
  const iso8601String = name.substr(0, 8) + 'T' + name.substr(8, 6);
  const time = Cesium.JulianDate.fromIso8601(iso8601String);
  return Cesium.JulianDate.addHours(time, 8, new Cesium.JulianDate());
}

export function parseNameFunc5(file) {
  const name = file.split('_')[1];
  const iso8601String = name.substr(0, 8) + 'T' + name.substr(8, 6);
  return Cesium.JulianDate.fromIso8601(iso8601String);
}

export function parseNameFunc6(file) {
  const names = file.split('_');
  const iso8601String = names[1] + 'T' + names[2];
  return Cesium.JulianDate.fromIso8601(iso8601String);
}
