
function expWindData() {

}

expWindData.getNecpTimeDate = function (dayNum) {
  const dates = [];
  const now = new Date(new Date().getTime() - 8 * 3600 * 1000);
  now.setMinutes(0);
  now.setSeconds(0);
  now.setMilliseconds(0);
  const noSixHourToday = Math.floor(now.getHours() / 6);
  now.setHours(noSixHourToday * 6);
  const numSixHourToday = noSixHourToday + 1;
  const numTime = dayNum * 4 + numSixHourToday;
  // d = 1 最近一个6小时没数据，跳过
  for (let d = 1; d < numTime; d++) {
    dates.push(new Date(now.getTime() - d * 6 * 3600 * 1000));
  }
  return dates;
};

expWindData.toJulianDate = function (dates) {
  const jDates = [];

  dates.forEach((d) => {
    jDates.push(Cesium.JulianDate.fromDate(new Date(d.getTime() + 8 * 3600 * 1000), new Cesium.JulianDate()));
  });

  return jDates;
};


const numWind = 18;


function getDay(n) {
  const today = new Date(new Date().getTime() - (numWind) * 6 * 60 * 60 * 1000);
  today.setMinutes(0);
  today.setSeconds(0);
  today.setMilliseconds(0);
  const julianDT = Cesium.JulianDate.fromDate(today, new Cesium.JulianDate());
  Cesium.JulianDate.addHours(julianDT, n * 6, julianDT);
  const gregorianDTNow = Cesium.JulianDate.toGregorianDate(julianDT);

  const month = gregorianDTNow.month.toString().padStart(2, '0');
  const day = gregorianDTNow.day.toString().padStart(2, '0');

  gregorianDTNow.hour = Math.floor(gregorianDTNow.hour / 6) * 6;
  const hour = gregorianDTNow.hour.toString().padStart(2, '0');

  return `${gregorianDTNow.year}/${month}/${day} ${hour}`;
}

expWindData.data = {
  Ncep: [''],
  其他: ['', '中国区半球'],
  台风: [
    '',
    'LIONROCK',
    'LUPIT',
    'DUJUAN',
    'CONSON',
    'IN-FA',
    'CEMPAKA',
    'CHAMPI',
    'CHANTHU',
    'CHOI-WAN',
    'DIANMU',
    'KOGUMA',
    'MINDULLE',
    'MIRINAE',
    'NEPARTAK',
    'NIDA',
    'OMAIS',
    'SURIGAE',
  ]
};

expWindData.getLatestNecp = function () {
  for (let i = 0; i < numWind; i++) {
    const data = getDay(i);
    expWindData.data.Ncep.push(data);
  }
};

export default expWindData;
