const Whatsapp = require('venom-bot');
const dialogflow = require('@google-cloud/dialogflow');

const sessionClient = new dialogflow.SessionsClient({ keyFilename: "./teste-qrscuw-82dcc41e32a9.json" });
async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
) {
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };
    if (contexts && contexts.length > 0) {
        request.queryParams = {
            contexts: contexts,
        };
    }
    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}
async function executeQueries(projectId, sessionId, queries, languageCode) {
    let context;
    let intentResponse;
    for (const query of queries) {
        try {
            console.log(`Sending Query: ${query}`);
            intentResponse = await detectIntent(
                projectId,
                sessionId,
                query,
                context,
                languageCode
            );
            console.log('Detected intent');
            return `${intentResponse.queryResult.fulfillmentText}`
        } catch (error) {
            console.log(error);
        }
    }
}
Whatsapp
    .create('API-Whatsapp',

        (base64Qrimg, asciiQR, attempts, urlCode) => {
            //console.log('Number of attempts to read the qrcode: ', attempts,'\n');
            // console.log('Terminal qrcode: ', asciiQR);
            // console.log('base64 image string qrcode: ', base64Qrimg);
            // console.log('urlCode (data-ref): ', urlCode);
        },

        (statusSession, session) => {
            console.log('Status Session: ', statusSession, '\n');
            console.log('Session name: ', session, '\n');
        },
        {
            folderNameToken: 'tokens',
            headless: true,
            devtools: false,
            useChrome: true,
            debug: false,
            logQR: true,
            browserArgs: ['--no-sandbox'],
            disableSpins: false,
            disableWelcome: true,
            updatesLog: false,
            autoClose: 60000,
            createPathFileToken: true,
        })
    .then((client) => start(client))
    .catch((erro) => { console.log(erro) });

Whatsapp.defaultLogger.level = 'silly';

function start(client) {
    client.onMessage(async message => {
        let textoResposta = await executeQueries("teste-qrscuw", message.from, [message.body], 'pt-BR')
        await client.sendText(message.from, textoResposta);
    })
}