const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const fs = require('fs');

const apiHandler = require('./routes/apiHandler');
const users = require('./routes/users');

const app = express();

// WebSocket
const expressWs = require('express-ws')(app);

// CORS Middlewear
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'dist')));

// Set views engine
app.engine('html', require('ejs').renderFile);

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Passport Middlewear
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

// Use Routes
app.use('/api', apiHandler);
app.use('/users', users);

let clients = {};
let messages = require('./data/messages');
let coordinates = require('./data/coordinates');
let counter = 0;

app.ws('/', (ws, req) => {
    let id = counter++;
    clients[id] = ws;
    console.log('WebSocket open');
    ws.on('message', (message) => {
        messages.push(message);
        // for (let cid in clients) {
        //     let client = clients[cid];
        //     client.send(JSON.stringify({
        //         type: 'message',
        //         message
        //     }));
        // coordinates.push(message);
        // for (let cid in clients) {
        //         let client = clients[cid];
        //         client.send(JSON.stringify({
        //             type: 'message',
        //             message
        //         }));
    });
    // ws.on('open', (messages, blocksPosition) => {
    //     for (let cid in clients) {
    //         let client = clients[cid];
    //         client.send(JSON.stringify({
    //             type: 'message',
    //             messages,
    //             blocksPosition
    //         }));
    //     }
    // });
    ws.on('close', () => {
        console.log('WebSocket close');
        // clearInterval(timer);
        delete clients[id];
    });
    ws.send(JSON.stringify({
        type: 'messages',
        messages
    }));
    ws.send(JSON.stringify({
        type: 'coordinates',
        coordinates
    }));
    // let timer = setInterval(() => {
    //     ws.send(JSON.stringify({
    //         type: 'memoryInfo',
    //         data: process.memoryUsage()
    //     }))
    // }, 200) 
  });

// Use redirect for all client requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});

    // Example disconnect
    /* setTimeout(() => {
        wsc.close()
    }, 5000) */

setInterval(() => {
    fs.writeFile('./data/messages.json', JSON.stringify(messages), (err) => {if (err) console.log('error',err)});
}, 1000);