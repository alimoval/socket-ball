<template>
  <div class='container'>
    <div class='row'>
        <div v-if='memory'>
            {{ memory }}
        </div>
        <ul style='list-style:none;'>
            <li v-for='message in messages' v-bind:key='message.id'>User {{message.id}}: {{ message.message }}</li>
        </ul>
        <div>online: {{ online }}</div>
        <form v-on:submit.prevent='sendMessage'>
          <input type='text' v-model='newMessage'>
          <input type='submit' value='Send'>
        </form>
        <button @click='disconnect'>Disconnect</button>
        <button @click='connect'>Connect</button>
        <br>
        <br>
        <!-- <ul>
            <li v-for='item in coordinates' v-bind:key='item.id'>{{ item }}</li>
        </ul> -->
        <div style='min-height:300px; width:100%; background:black; position: relative;'>
          <div v-for='item in coordinates' v-bind:key='item.id' v-bind:style='`width:19px;height:19px;background:white;position:absolute;left:${item.left}px;top:${item.top}px;background:${item.color}`'></div>
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
      userId: '',
      coordinates: [],
      newMessage: '',
      online: false,
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
        // console.log('User ' + this.userId + ' right to 10px')
        this.coordinates.forEach(item => {
          if (+item.id === this.userId){
            item.left = parseInt(item.left, 10) + 10 + ''
            this.ws.send(JSON.stringify(item))
          }
        })
      }
    },
    sendMessage () {
      this.ws.send(JSON.stringify({'id': this.userId, 'type': 'message', 'message': this.newMessage}))
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
            this.coordinates = []
            this.$set(this, 'coordinates', data.coordinates)
            break
          case 'user':
            this.$set(this, 'userId', data.id)
            break
        }
      } catch (e) {console.error(e)}
    },
    disconnect () {
        this.ws.close()
    },
    connect () {
      if (this.online) return false
      // this.ws = new WebSocket('ws://localhost:3000')
      let HOST = location.origin.replace(/^https/, 'wss')
      this.ws = new WebSocket(HOST)
      this.ws.addEventListener('open', () => { this.online = true})
      this.ws.addEventListener('close', () => { this.online = false })
      this.ws.addEventListener('error', (err) => { console.error(err) })
      this.ws.addEventListener('message', this.messageHandler.bind(this))
      window.onkeydown = this.clickHandler.bind(this);
    }
  }
}
</script>
