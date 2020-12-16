const AssistantV1 = require('ibm-watson/assistant/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const { rejects } = require('assert');
const assistant = new AssistantV1({
    authenticator: new IamAuthenticator({ apikey: '<>' }),
    serviceUrl: 'https://gateway.watsonplatform.net/assistant/api/', version: '2020-04-01'
});
let context = {} //I don't know what to put in context assistant.message( { input: { text: '2' },

//the answer "2" the nested node "Tramo Emision" workspaceId: '<>', context: context }, 
function (err, response) { if (err) { rejects(err) } else { context = response.context; } }) 
        .then(response => { console.log(JSON.stringify(response.result, null, 2)); })
    .catch(err => { console.log(err); });