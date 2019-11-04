import groupBy from 'lodash/groupBy'
import req from '@Network'
import types from '../Types'
import { createAction } from 'redux-actions'

export const initContacts = createAction(types.INIT_CONTACTS)

export function fetchContacts() {
  return (dispatch) => {
    return dispatch(initContacts(contacts))
  }
}
