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
let counter = 1;
let top = 1;
let colors = ['blue', 'yellow', 'red', 'green'];

app.ws('/', (ws, req) => {
    let id = counter++;
    let userTop = top++;
    let userColor = colors[Math.floor(Math.random()*colors.length)];
    userCoordinates = { "id": id+'', "type": "coordinates", "left": "10", "top": userTop*30+'', "color": userColor };
    coordinates.push(userCoordinates);
    clients[id] = ws;
    console.log('WebSocket open');
    ws.on('message', (message) => {
        message = JSON.parse(message)
        if(message.type === 'message'){
            console.log(message)
            messages.push(message);
            for (let cid in clients) {
                let client = clients[cid];
                client.send(JSON.stringify({
                    type: 'message',
                    message
                }));
            }
        } else {
            coordinates.forEach((item, i, arr) => {
                if(item.id === message.id){
                    arr[i] = message
                }
                console.log(coordinates)
            });
            for (let cid in clients) {
                let client = clients[cid];
                client.send(JSON.stringify({
                    type: 'coordinates',
                    coordinates
                }));
            }
        }
    });
    // ws.on('open', (messages) => {
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
        delete clients[id];
    });
    ws.send(JSON.stringify({
        type: 'messages',
        messages
    }));
    for (let cid in clients) {
        let client = clients[cid];
        client.send(JSON.stringify({
            type: 'coordinates',
            coordinates
        }));
    }
    ws.send(JSON.stringify({
        type: 'user',
        id
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

// setInterval(() => {
//     fs.writeFile('./data/messages.json', JSON.stringify(messages), (err) => {if (err) console.log('error',err)});
// }, 1000);