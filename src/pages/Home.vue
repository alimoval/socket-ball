<template>
  <div class='container'>
    <div class='row'>
        <div>
            {{ memory }}
        </div>
        <ul>
            <li v-for="message in messages" v-bind:key='message.id'>{{ message }}</li>
        </ul>
        <div>{{ online }}</div>
        <input type="text" v-model="newMessage">
        <button @click="send">Send</button>
        <button @click="disconnect">Disconnect</button>
        <button @click="connect">Connect</button>
        <ul>
            <li v-for="block in blocksPosition" v-bind:key='block.id'>{{ block }}</li>
        </ul>
    </div>
  </div>
</template>

<script>
// Vue.filter('disabled', function(val) { return val ? 'disabled': ''})
export default {
  name: 'home',
  data: function () {
    return {
      messages: [],
      blocksPosition: [],
      newMessage: '',
      online: false,
      memory: {}
    }
  },
  created () {
    this.connect()
  },
  destroyed () {
      this.ws.close()
  },
  methods: {
    send () {
      this.ws.send(this.newMessage)
      this.newMessage = ''
    },
    messageHandler(message) {
      try {
        let data = JSON.parse(message.data)
        switch(data.type) {
          case 'messages':
            this.$set(this, 'messages', data.messages)
            break;
          case 'message':
            this.messages.push(data.message)
            break;
          case 'memoryInfo':
            this.$set(this, 'memory', data.data)
        }
      } catch (e) {console.error(e)}
    },
    disconnect () {
        this.ws.close()
    },
    connect () {
      if (this.online) return false
      this.ws = new WebSocket('ws://localhost:3000')
      this.ws.addEventListener('open', (messages, blocksPosition) => { 
        this.online = true
        this.messages = messages
        this.blocksPosition = blocksPosition
        console.log(this.messages)
        console.log(this.blocksPosition)
      })
      this.ws.addEventListener('close', () => { this.online = false })
      this.ws.addEventListener('error', (err) => { console.error(err) })
      this.ws.addEventListener('message', this.messageHandler.bind(this))
    }
  }
}
</script>
