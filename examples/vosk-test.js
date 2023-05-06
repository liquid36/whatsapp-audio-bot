var vosk = require('vosk')

const fs = require("fs");
const { spawn } = require("child_process");

MODEL_PATH = "model"
FILE_NAME = "some-file-name.oga"
SAMPLE_RATE = 16000
BUFFER_SIZE = 4000

if (!fs.existsSync(MODEL_PATH)) {
    console.log("Please download the model from https://alphacephei.com/vosk/models and unpack as " + MODEL_PATH + " in the current folder.")
    process.exit()
}

if (process.argv.length > 2)
    FILE_NAME = process.argv[2]

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);
const rec = new vosk.Recognizer({model: model, sampleRate: SAMPLE_RATE});

const ffmpeg_run = spawn('ffmpeg', ['-loglevel', 'quiet', '-i', FILE_NAME,
                         '-ar', String(SAMPLE_RATE) , '-ac', '1',
                         '-f', 's16le', '-bufsize', String(BUFFER_SIZE) , '-']);

ffmpeg_run.stdout.on('data', (stdout) => {
    console.log('FRAME')
    if (rec.acceptWaveform(stdout))
        console.log(rec.result());
    else
        console.log(rec.partialResult());
    console.log(rec.finalResult());
});

ffmpeg_run.stdout.on('end', () => {
    console.log('END');
});