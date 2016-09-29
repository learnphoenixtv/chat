import {Socket, Presence} from 'phoenix'

class Chat {
  constructor (roomName) {
    this.presences = {}
    this.roomName = roomName
    this.userList = document.getElementById('user-list')
    this.messageInput = document.getElementById('new-message')
    this.messageList = document.getElementById('message-list')
    this.formatPresences = this.formatPresences.bind(this)
    this.renderPresences = this.renderPresences.bind(this)
    this.renderMessage = this.renderMessage.bind(this)
  }

  initialize () {
    // Ask for the user's name
    this.user = window.prompt('What is your name?') || 'Anonymous'

    // Set up the websocket connection
    this.socket = new Socket('/socket', {params: {user: this.user}})
    this.socket.connect()

    // Set up room
    this.room = this.socket.channel(this.roomName)

    // Sync presence state
    this.room.on('presence_state', state => {
      this.presences = Presence.syncState(this.presences, state)
      this.renderPresences(this.presences)
    })

    this.room.on('presence_diff', state => {
      this.presences = Presence.syncDiff(this.presences, state)
      this.renderPresences(this.presences)
    })

    // Set up new message handler
    this.room.on('message:new', this.renderMessage)
    this.room.on('messages:recent', ({data: messages}) => {
      messages.map(this.renderMessage)
    })

    // Set up input handlers
    this.messageInput.addEventListener('keypress', (e) => {
      if (e.keyCode === 13 && this.messageInput != '') {
        this.room.push('message:new', this.messageInput.value)
        this.messageInput.value = ''
      }
    })

    // Join the room
    this.room.join()
  }

  formatTimestamp (timestamp) {
    let date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  formatPresences (presences) {
    return Presence.list(presences, (user, {metas}) => {
      return {
        user: user,
        onlineAt: this.formatTimestamp(metas[0].online_at)
      }
    })
  }

  renderPresences (presences) {
    let html = this.formatPresences(presences).map(presence => `
      <li>
        ${presence.user}
        <br />
        <small>online since ${presence.onlineAt}</small>
      </li>
    `).join('')

    this.userList.innerHTML = html
  }

  renderMessage (message) {
    let messageElement = document.createElement('li')
    messageElement.innerHTML = `
      <b>${message.user}</b>
      <i>${this.formatTimestamp(message.timestamp)}</i>
      <p>${message.body}</b>
    `
    this.messageList.appendChild(messageElement)
    this.messageList.scrollTop = this.messageList.scrollHeight
  }
}

export default Chat
