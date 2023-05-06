import vosk from 'vosk';
import fs from "fs";
import { spawn } from "child_process";

const MODEL_PATH = "model/vosk-model-es-0.42" || process.env.MODEL_PATH;
const SAMPLE_RATE = 16000
const BUFFER_SIZE = 4000
vosk.setLogLevel(0);


export function speachToText(fileName) {
    const FILE_NAME = fileName;
    
    if (!fs.existsSync(MODEL_PATH)) {
        console.error("Please download the model from https://alphacephei.com/vosk/models and unpack as " + MODEL_PATH + " in the current folder.")
        throw new Error('NO_MODEL_FOUND');
    }

    return new Promise((resolve, reject) => {
        // [TODO] only once?
        const model = new vosk.Model(MODEL_PATH);
        const rec = new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE});
    
        const ffmpeg_run = spawn('ffmpeg', ['-loglevel', 'quiet', '-i', FILE_NAME,
                                 '-ar', String(SAMPLE_RATE) , '-ac', '1',
                                 '-f', 's16le', '-bufsize', String(BUFFER_SIZE) , '-']);
    
        let result = '';
        ffmpeg_run.stdout.on('data', (stdout) => {
            if (rec.acceptWaveform(stdout)) {
                rec.result();
            } else {
                rec.partialResult(); 
            }
            const r = rec.finalResult();
            result = result +  ' ' + r.text;
        });
        
        ffmpeg_run.stdout.on('end', () => {
            resolve(result);
        });

    });

}

// speachToText('some-file-name.wav').then(console.log);

