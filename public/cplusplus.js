/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
function callFromC(func) {
  if (Cesium.defined(func)) {
    try {
      func();
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err);
    }
  }
}

function ceval(method, json) {
  app.__vue__.$message({
    message: 'click on item ' + method + ' ' + json,
    offset: 50
  });
}

function showColorCard(show) {
  app.__vue__.$store.commit('showColorCard', show);
}
