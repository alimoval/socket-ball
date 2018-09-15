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
        <button @click="sendMessage">Send</button>
        <button @click="disconnect">Disconnect</button>
        <button @click="connect">Connect</button>
        <ul>
            <li v-for="item in coordinates" v-bind:key='item.id'>{{ item }}</li>
        </ul>
        <div style='min-height:300px; width:100%; background:black; position: relative;'>
          <div v-for="item in coordinates" v-bind:key='item.id' v-bind:style='`width:19px;height:19px;background:white;position:absolute;left:${item.left}px;top:${item.top}px;background:${item.color}`'></div>
        </div>
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
      coordinates: [],
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
    clickHandler (event) {
      event = event || window.event
      var key = event.key || event.keyCode || event.code;
      if(key === 39 || key === 'ArrowRight'){
        console.log('Right to 10px')
        this.coordinates.forEach(item => {
          if (item.id === '1'){
            item.left = parseInt(item.left, 10) + 10 + ''
            console.log(item)
          }
        })
        this.ws.send(this.coordinates)
      }
    },
    sendMessage () {
      this.ws.send(this.newMessage)
      this.newMessage = ''
    },
    messageHandler(event) {
      try {
        let data = JSON.parse(event.data)
        switch(data.type) {
          case 'messages':
            this.$set(this, 'messages', data.messages)
            break
          case 'message':
            this.messages.push(data.message)
            break
          case 'memoryInfo':
            this.$set(this, 'memory', data.data)
            break
          case 'coordinates':
            this.$set(this, 'coordinates', data.coordinates)
            break
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
      window.onkeydown = this.clickHandler.bind(this);
    }
  }
}
</script>
