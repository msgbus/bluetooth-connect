import req from '@Network'
import types from '../Types'
import { createAction } from 'redux-actions'

export const initTimeline = createAction(types.INIT_TIMELINE)
export const appendTimeline = createAction(types.APPEND_TIMELINE)
export const prependTimeline = createAction(types.PREPEND_TIMELINE)
export const updatePost = createAction(types.UPDATE_POST)
export const updateDevice = createAction(types.UPDATE_DEVICE)
export const refreshHomeAction = createAction(types.REFRESH_HOME)

export function fetchTimeline() {
  return (dispatch) => {
    return new Promise(function(resolve, reject) { resolve(); })
  }
}

export function refreshTimeline() {
  return (dispatch) => {
    return new Promise(function(resolve, reject) { resolve(); })
  }
}

export function loadMoreTimeline() {
  return (dispatch) => {
    return req.get('/more_timeline.json').then(res => {
      const data = res.data
      dispatch(appendTimeline(data))
    })
  }
}

export function refreshDevice() {
  return (dispatch) => {
    dispatch(updateDevice())
  }
}

export function updateRefreshHome(refreshing) {
  return (dispatch) => {
    dispatch(refreshHomeAction(refreshing))
  }
}
