import express from 'express';
import bodyParser from 'body-parser';

export function initServer() {
    const app = express();
    app.use(bodyParser.urlencoded({ extended: true }));

    return app;
}