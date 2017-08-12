// see https://redux-saga.github.io/redux-saga/ (at least Basic Concepts)

import { takeLatest, takeEvery } from 'redux-saga'
import { call, put } from 'redux-saga/effects'

// TODO get as params
import * as ActionTypes from './actionTypes'

export default function sagaFactory (client, handleLatest = [], handleEvery = []) {
  function * handler (action) {
    try {
      const json = yield call(client.handleAction, action)
      let success = {
        type: ActionTypes[action.type.replace('REQUESTED', 'SUCCEEDED')]
      }
      if (json) {
        success.json = json
      } else {
        success.requestedAction = action
      }
      yield put(success)
    } catch (e) {
      let error = {
        type: ActionTypes[action.type.replace('REQUESTED', 'FAILED')],
        message: e.message
      }
      yield put(error)
    }
  }

  return function * run () {
    yield [
      ...handleLatest.map(actionType => takeLatest(actionType, handler)),
      ...handleEvery.map(actionType => takeEvery(actionType, handler))
    ]
  }
}
