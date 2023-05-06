import venom from 'venom-bot';
import fs from 'fs';
import mime from 'mime-types';
import { speachToText } from './vosk.js';

venom.create({
        session: 'session-carlos',
        multidevice: true,
        statusFind: (statusSession, session) => {
            console.log('Status Session: ',session, statusSession); 
        }
    })
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });


function start(client) {
    function exit() { 
        client.close().then(() => {
            console.log('EXIT');
            process.exit();
        })
    }
    process.on('SIGQUIT', exit);
    process.on('SIGTERM', exit);
    process.on('SIGINT', exit);

    const chats = client.getAllChats().then((chats) => {
        console.log(chats);
    });

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

        if (message.type === 'ptt') {
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

