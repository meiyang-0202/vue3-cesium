/* DefaultState */
interface ObjToolTip {
  [key: string]: any
}

export interface DefaultState {
  showCommand: boolean,
  debugTooltip: boolean,
  showToolTip: boolean,
  collapseTooltip: boolean,
  popupToolTips: ObjToolTip,
  tiltToolTips: ObjToolTip,
  pointToolTips: ObjToolTip
}

/* WeState */
export interface WeState {
  _viewPoint: any,
  _lengedColorArray: { color?: string, value?: string }[],
  _showLengend: boolean,
  _showVolumeButton: boolean
}
