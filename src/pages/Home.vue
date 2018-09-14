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
        <div v-html='block' style='min-height:300px; width:100%; background:black; position: relative;'></div>
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
      memory: {},
      block: '<div style="width:20px;height:20px; background:white; position:absolute; left:10px;top:10px"></div>'
    }
  },
  created () {
    this.connect()
    this.setPosition()
  },
  destroyed () {
      this.ws.close()
  },
  methods: {
    setPosition () {
      console.log(this.blocksPosition)
    },
    send () {
      this.ws.send(this.newMessage)
      this.newMessage = ''
    },
    messageHandler(event) {
      try {
        let data = JSON.parse(event.data)
        switch(data.type) {
          case 'messages':
            this.$set(this, 'messages', data.messages)
            break;
          case 'message':
            this.messages.push(data.message)
            break;
          case 'memoryInfo':
            this.$set(this, 'memory', data.data)
          case 'blocks position':
          this.$set(this, 'blocksPosition', data.blocksPossition)
        }
      } catch (e) {console.error(e)}
    },
    disconnect () {
        this.ws.close()
    },
    connect () {
      if (this.online) return false
      this.ws = new WebSocket('ws://localhost:3000')
      this.ws.addEventListener('open', () => { this.online = true})
      this.ws.addEventListener('close', () => { this.online = false })
      this.ws.addEventListener('error', (err) => { console.error(err) })
      this.ws.addEventListener('message', this.messageHandler.bind(this))
    }
  }
}
</script>
