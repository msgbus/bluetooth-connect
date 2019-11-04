import req from '@Network'
import types from '../Types'
import { createAction } from 'redux-actions'

export const initTimeline = createAction(types.INIT_TIMELINE)
export const appendTimeline = createAction(types.APPEND_TIMELINE)
export const prependTimeline = createAction(types.PREPEND_TIMELINE)
export const updatePost = createAction(types.UPDATE_POST)

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
