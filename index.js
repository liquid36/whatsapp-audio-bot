import venom from 'venom-bot';
import fs from 'fs';
import mime from 'mime-types';
import { speachToText } from './vosk.js';
import { initServer } from './server.js';

const app = initServer();


let status = 'init';
let WAClient;

app.get('/status', (req, res) => {
    res.json({ status });
});

app.get('/chats', async (req, res) => {
    if (!WAClient) {
        return res.status(400).json('Server is starting');
    }
    const chats = await WAClient.getAllChats();
    return res.json(chats);
});

app.get('/contacts', async (req, res) => {
    if (!WAClient) {
        return res.status(400).json('Server is starting');
    }
    const contacts = await WAClient.getAllContacts();
    return res.json(contacts);
});

app.get('/messages', async (req, res) => {
    if (!WAClient) {
        return res.status(400).json('Server is starting');
    }
    const id = req.query.id;

    const messages = await WAClient.getAllMessagesInChat(id);
    return res.json(messages);
});

app.get('/messages/audio', async (req, res) => {
    if (!WAClient) {
        return res.status(400).json('Server is starting');
    }
    const id = req.query.id;
    const message = await WAClient.getMessageById(id);

    const buffer = await WAClient.decryptFile(message);
    
    const idName = message.id.replace('@', '').replace('.', '').replace('_', '').replace('_', '');
    const fileName = `${idName}.${mime.extension(message.mimetype)}`;
    fs.writeFileSync(fileName, buffer);

    const text = await speachToText(fileName);
    fs.unlinkSync(fileName);
    res.json({ text });
});

app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});

venom.create({
        session: 'session-carlos',
        multidevice: true,
        disableSpins: true,
        disableWelcome: true,
        statusFind: (statusSession, session) => {
            status = statusSession;
            console.log('Status Session: ',session, statusSession); 
        }
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });


function start(client) {
    WAClient = client;

    function exit() { 
        client.close().then(() => {
            console.log('EXIT');
            process.exit();
        })
    }
    process.on('SIGQUIT', exit);
    process.on('SIGTERM', exit);
    process.on('SIGINT', exit);

    

    client.onMessage(async (message) => {
        // console.log(message);
        console.log(message.id, message.type, message.body);
        
        if (message.body === 'Hi' && message.isGroupMsg === false && 1 === 2) {
            client
                .sendText(message.from, 'Welcome Venom 🕷')
                .then((result) => {
                    console.log('Result: ', result); //return object success
                })
                .catch((erro) => {
                    console.error('Error when sending: ', erro); //return object error
                });
        }

        if (message.type === 'ptt' || message.type === 'audio') {
            const buffer = await client.decryptFile(message);
            const id = message.id.replace('@', '').replace('.', '').replace('_', '').replace('_', '');
            const fileName = `${id}.${mime.extension(message.mimetype)}`;
            fs.writeFileSync(fileName, buffer);

            const text = await speachToText(fileName);
            if (text.length > 0) {
                console.log(text);
                client.sendText(message.from, text);
            }

            fs.unlinkSync(fileName);
        }
        

    });
}

