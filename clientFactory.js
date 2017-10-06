import cuid from 'cuid'
import * as ActionTypes from './actionTypes'

export default function clientFactory (config, fetch, FormData) {
  const service = config.service
  const cloudinary = {
    url: `https://api.cloudinary.com/v1_1/${config.cloudinary.cloud}/image/upload`,
    preset: config.cloudinary.preset
  }

  // TODO: change to hydra:collection pattern
  const collections = {
    people: { type: 'Person' },
    projects: { type: 'Project' },
    places: { type: 'Place' },
    intents: { type: 'Intent' },
    sessions: { type: 'Session' },
    followings: { type: 'Following' },
    favorings: { type: 'Favoring' },
    conversations: { type: 'Conversation' },
    messages: { type: 'Message' },
    reviews: { type: 'Review' },
    collaborations: { type: 'Collaboration' },
    subscriptions: { type: 'Subscription' },
    notifications: { type: 'Notification' },
    labels: { type: 'Label' },
    categories: { type: 'Category' }
  }

  function collectionUrl (actionType) {
    let key = actionType.replace('FETCH_', '').replace('_REQUESTED', '').toLowerCase()
    return service + '/' + key
  }

  function mintUrl (resource) {
    let path = Object.keys(collections)
                .find(key => collections[key].type === resource.type)
    return `${service}/${path}/${cuid()}`
  }

  async function get (url) {
    let response = await fetch(url, {
      credentials: 'include'
    })
    let json = await response.json()
    if (response.ok) return json
    else throw json
  }

  async function put (resource) {
    if (!resource._id) resource._id = mintUrl(resource)
    let response = await fetch(resource._id, {
      method: 'PUT',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(resource)
    })
    let json = await response.json()
    if (response.ok) return json
    else throw json
  }

  async function del (resource) {
    let response = await fetch(resource._id, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!response.ok) {
      let json = await response.json()
      throw json
    }
  }

  async function uploadImageAndSave (entity, image) {
    if (!image) return put(entity)
    let data = new FormData()
    data.append('file', image)
    data.append('upload_preset', cloudinary.preset)
    let response = await fetch(cloudinary.url, {
      method: 'POST',
      body: data
    })
    if (!response.ok) { throw new Error() }
    let cloudinaryData = await response.json()
    let updated = Object.assign({}, entity, {
      logo: cloudinaryData.secure_url
    })
    return put(updated)
  }

  return {
    mintUrl,
    handleAction (action) {
      switch (action.type) {
        case ActionTypes.HELLO_REQUESTED:
          return get(service)
        case ActionTypes.FETCH_CATEGORIES_REQUESTED:
        case ActionTypes.FETCH_LABELS_REQUESTED:
        case ActionTypes.FETCH_PROJECTS_REQUESTED:
        case ActionTypes.FETCH_PLACES_REQUESTED:
        case ActionTypes.FETCH_PEOPLE_REQUESTED:
        case ActionTypes.FETCH_INTENTS_REQUESTED:
        case ActionTypes.FETCH_REVIEWS_REQUESTED:
          return get(collectionUrl(action.type))
        case ActionTypes.FETCH_PERSON_REQUESTED:
          return get(action.id)
        // TODO: change to hydra:collection pattern
        case ActionTypes.FETCH_MY_CONVERSATIONS_REQUESTED:
          return get(action.person._id + '/conversations')
        case ActionTypes.FETCH_NOTIFICATIONS_REQUESTED:
          return get(action.person._id + '/notifications')
        case ActionTypes.SAVE_INTENT_REQUESTED:
          return uploadImageAndSave(action.intent, action.image)
        case ActionTypes.SAVE_PROJECT_REQUESTED:
          return uploadImageAndSave(action.project, action.image)
        case ActionTypes.SAVE_PERSON_REQUESTED:
          return uploadImageAndSave(action.person, action.image)
        case ActionTypes.FOLLOW_REQUESTED:
          return put(action.following)
        case ActionTypes.FAVOR_REQUESTED:
          return put(action.favoring)
        case ActionTypes.SAVE_SUBSCRIPTION_REQUESTED:
          return put(action.subscription)
        case ActionTypes.START_CONVERSATION_REQUESTED:
          return put(action.conversation)
        case ActionTypes.ADD_MESSAGE_REQUESTED:
          return put(action.message)
        case ActionTypes.ADD_REVIEW_REQUESTED:
          return put(action.review)
        case ActionTypes.SAVE_NOTIFICATION_REQUESTED:
          return put(action.notification)
        case ActionTypes.SAVE_PLACE_REQUESTED:
          return put(action.place)
        case ActionTypes.BYE_REQUESTED:
          return del(action.session)
        case ActionTypes.UNFOLLOW_REQUESTED:
          return del(action.following)
        case ActionTypes.UNFAVOR_REQUESTED:
          return del(action.favoring)
        default:
          throw new Error('unknown action: ' + action.type)
      }
    }
  }
}
