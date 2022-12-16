
function bindGUI(folder, ui) {
  Object.keys(ui).forEach((element) => {
    const obj = ui[element];
    const value = obj[element];
    const t = typeof value;
    if (obj.min !== undefined && obj.max !== undefined) {
      folder.add(obj, element, obj.min, obj.max).onChange(obj.func);
    } else if (t === 'object') {
      folder.add(obj, element, value).onChange(obj.func);
    } else {
      folder.add(obj, element).onChange(obj.func);
    }
  });
}

export default bindGUI;
