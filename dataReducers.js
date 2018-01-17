import * as ActionTypes from './actionTypes'

function removeElement (array, element) {
  return array.filter(el => el._id !== element._id)
}

function replaceOrAddElement (array, element, prepend = false) {
  if (prepend) {
    return [
      Object.assign({}, element),
      ...removeElement(array, element)
    ]
  } else {
    return [
      ...removeElement(array, element),
      Object.assign({}, element)
    ]
  }
}

export function projects (state = [], action) {
  switch (action.type) {
    case ActionTypes.FETCH_PROJECTS_SUCCEEDED:
      // normalize
      return action.json.map(project => {
        if (!project.links) project.links = []
        if (!project.contacts) project.contacts = []
        if (!project.categories) project.categories = []
        if (!project.locations) project.locations = []
        return project
      })
    case ActionTypes.SAVE_PROJECT_SUCCEEDED:
      return replaceOrAddElement(state, action.json, true)
    default:
      return state
  }
}

export function intents (state = [], action) {
  switch (action.type) {
    case ActionTypes.FETCH_INTENTS_SUCCEEDED:
      return action.json.map(intent => {
        if (!intent.abortedConversations) intent.abortedConversations = []
        if (!intent.successfulConversations) intent.successfulConversations = []
        return intent
      })
    case ActionTypes.SAVE_INTENT_SUCCEEDED:
      return replaceOrAddElement(state, action.json, true)
    default:
      return state
  }
}

export function categories (state = [], action) {
  switch (action.type) {
    case ActionTypes.FETCH_CATEGORIES_SUCCEEDED:
      return action.json
    default:
      return state
  }
}

export function places (state = [], action) {
  switch (action.type) {
    case ActionTypes.FETCH_PLACES_SUCCEEDED:
      return action.json
    case ActionTypes.SAVE_PLACE_REQUESTED:
      return replaceOrAddElement(state, action.place)
    default:
      return state
  }
}

export function reviews (state = [], action) {
  switch (action.type) {
    case ActionTypes.FETCH_REVIEWS_SUCCEEDED:
      return action.json
    case ActionTypes.ADD_REVIEW_SUCCEEDED:
      return replaceOrAddElement(state, action.json)
    default:
      return state
  }
}

export function matchings (state = [], action) {
  switch (action.type) {
    case ActionTypes.FETCH_MATCHINGS_SUCCEEDED:
      return action.json
    case ActionTypes.MATCH_SUCCEEDED:
      return replaceOrAddElement(state, action.json)
    default:
      return state
  }
}

export function people (state = [], action) {
  switch (action.type) {
    case ActionTypes.FETCH_PEOPLE_SUCCEEDED:
      return action.json
    default:
      return state
  }
}

export function myConversations (state = [], action) {
  let conversation
  let updated
  switch (action.type) {
    case ActionTypes.FETCH_MY_CONVERSATIONS_SUCCEEDED:
      return action.json
    case ActionTypes.START_CONVERSATION_SUCCEEDED:
      return replaceOrAddElement(state, action.json)
    case ActionTypes.ADD_MESSAGE_SUCCEEDED:
      conversation = state.find(conversation => conversation._id === action.json.conversation)
      updated = Object.assign({}, conversation, {
        messages: replaceOrAddElement(conversation.messages, action.json)})
      return replaceOrAddElement(state, updated)
    default:
      return state
  }
}

export function notifications (state = [], action) {
  switch (action.type) {
    case ActionTypes.FETCH_NOTIFICATIONS_SUCCEEDED:
      return action.json
    case ActionTypes.SAVE_NOTIFICATION_SUCCEEDED:
      return removeElement(state, action.json)
    default:
      return state
  }
}

export function person (state = null, action) {
  switch (action.type) {
    case ActionTypes.FETCH_PERSON_SUCCEEDED:
      if (!action.json.categories) action.json.categories = []
      if (!action.json.followings) action.json.followings = []
      if (!action.json.favorings) action.json.favorings = []
      return action.json
    case ActionTypes.SAVE_PERSON_SUCCEEDED:
      return action.json
    case ActionTypes.BYE_SUCCEEDED:
      return null
    case ActionTypes.FOLLOW_SUCCEEDED:
      return Object.assign({}, state, {
        followings: replaceOrAddElement(state.followings, action.json)})
    case ActionTypes.UNFOLLOW_SUCCEEDED:
      return Object.assign({}, state, {
        followings: removeElement(state.followings, action.requestedAction.following)
      })
    case ActionTypes.FAVOR_SUCCEEDED:
      return Object.assign({}, state, {
        favorings: replaceOrAddElement(state.favorings, action.json)})
    case ActionTypes.UNFAVOR_SUCCEEDED:
      return Object.assign({}, state, {
        favorings: removeElement(state.favorings, action.requestedAction.favoring)
      })
    default:
      return state
  }
}

export function session (state = null, action) {
  switch (action.type) {
    case ActionTypes.HELLO_SUCCEEDED:
      return action.json.session || state
    case ActionTypes.BYE_SUCCEEDED:
      return null
    default:
      return state
  }
}

export function loginProviders (state = {}, action) {
  switch (action.type) {
    case ActionTypes.HELLO_SUCCEEDED:
      return action.json.loginProviders
    default:
      return state
  }
}
