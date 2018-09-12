const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const ws = require('ws');
const fs = require('fs');

const apiHandler = require('./routes/apiHandler');
const users = require('./routes/users');

const app = express();

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

// Use redirect for all client requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});


var clients = {};
var messages = require('./data/messages');
var counter = 0;
var wss = new ws.Server({port: 5555});

wss.on('connection', (wsc, request) => {
    console.log(request.headers.cookie);
    let id = counter++;
    clients[id] = wsc;
    wsc.on('message', (message) => {
        messages.push(message);
        for (let cid in clients) {
            let client = clients[cid];
            client.send(JSON.stringify({
                type: 'message',
                message
            }));
        }
        /* 
            wss.clients.forEach((client) => {
                client.send(JSON.stringify({
                    type: 'message',
                    message
                }));
            })
        */
    });

    wsc.on('close', () => {
        console.log('connect close');
        // clearInterval(timer);
        delete clients[id];
    })

    wsc.send(JSON.stringify({
        type: 'messages',
        messages
    }));


    /* let timer = setInterval(() => {
        wsc.send(JSON.stringify({
            type: 'memoryInfo',
            data: process.memoryUsage()
        }))
    }, 200) */

    // Example disconnect
    /* setTimeout(() => {
        wsc.close()
    }, 5000) */
})

setInterval(() => {
    fs.writeFile('./data/messages.json', JSON.stringify(messages), (err) => {if (err) console.log('error',err)});
}, 1000);