/**
 * 计算风的级别
 * @param speed
 * @returns {number}
 */
export function calcWindLevel(speed: number) {
  if (speed < 0 || speed == null) {
    return 0
  }
  if (speed <= 0.2) {
    return 0
  }
  if (speed <= 1.5) {
    return 1
  }
  if (speed <= 3.3) {
    return 2
  }
  if (speed <= 5.4) {
    return 3
  }
  if (speed <= 7.9) {
    return 4
  }
  if (speed <= 10.7) {
    return 5
  }
  if (speed <= 13.8) {
    return 6
  }
  if (speed <= 17.1) {
    return 7
  }
  if (speed <= 20.7) {
    return 8
  }
  if (speed <= 24.4) {
    return 9
  }
  if (speed <= 28.4) {
    return 10
  }
  if (speed <= 32.6) {
    return 11
  }
  if (speed <= 36.9) {
    return 12
  }
  if (speed <= 41.4) {
    return 13
  }
  if (speed <= 46.1) {
    return 14
  }
  if (speed <= 50.9) {
    return 15
  }
  if (speed <= 56.0) {
    return 16
  }
  if (speed <= 61.2) {
    return 17
  }
  return 18
}

/**
 * 计算风向
 * @param direct
 * @returns {string}
 */
export function calcWindDirectDesp(direct: number) {
  if (direct <= 22.5 / 2 || direct == null) {
    return '北'
  }
  if (direct <= 67.5 / 2) {
    return '北东北'
  }
  if (direct <= 67.5 - 11.25) {
    return '东北'
  }
  if (direct <= 67.5 + 11.25) {
    return '东东北'
  }
  if (direct <= 112.5 - 11.25) {
    return '东'
  }
  if (direct <= 112.5 + 11.25) {
    return '东东南'
  }
  if (direct <= 157.5 - 11.25) {
    return '东南'
  }
  if (direct <= 157.5 + 11.25) {
    return '南东南'
  }
  if (direct <= 202.5 - 11.25) {
    return '南'
  }
  if (direct <= 202.5 + 11.25) {
    return '南西南'
  }
  if (direct <= 247.5 - 11.25) {
    return '西南'
  }
  if (direct <= 247.5 + 11.25) {
    return '西西南'
  }
  if (direct <= 292.5 - 11.25) {
    return '西'
  }
  if (direct <= 292.5 + 11.25) {
    return '西西北'
  }
  if (direct <= 337.5 - 11.25) {
    return '西北'
  }
  if (direct <= 337.5 + 11.25) {
    return '北西北'
  }
  return '北'
}
