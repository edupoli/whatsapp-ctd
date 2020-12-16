// IMPORTANDO O VENOM E O DIALOGFLOW
const venom = require('venom-bot');
const dialogflow = require('@google-cloud/dialogflow');

// INICIANDO O DIALOGFLOW E CONFIGURANDO COM O USO DA KEY GERADA EM JSON, DEVE SE ENCONTRAR NA RAIZ DO PROJETO
const sessionClient = new dialogflow.SessionsClient({keyFilename: "kkkkkkkkkkk.json"});
// FUNCOES USADAS DA DOCUMENTACAO NORMAL QUE ESTAO NO README.md EM LINKS ÚTEIS
async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
  ) {
    // The path to identify the agent that owns the created intent.
    const sessionPath = sessionClient.projectAgentSessionPath(
      projectId,
      sessionId
    );
  
    // The text query request.
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
async function executeQueries(projectId, sessionId, queries, languageCode) 
{
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
// FIM DA CONFIGURACAO E FUNCOES DO DIALOGFLOW

// INICIANDO O VENOM BOT
// PARAMETROS USADO PELO VENOM
const parameters = {
    headless: true, // Headless chrome
    devtools: false, // Open devtools by default
    useChrome: true, // If false will use Chromium instance
    debug: false, // Opens a debug session
    logQR: true, // Logs QR automatically in terminal
    browserArgs: [''], // Parameters to be added into the chrome browser instance
    refreshQR: 15000, // Will refresh QR every 15 seconds, 0 will load QR once. Default is 30 seconds
    autoClose: 60000, // Will auto close automatically if not synced, 'false' won't auto close. Default is 60 seconds (#Important!!! Will automatically set 'refreshQR' to 1000#)
    disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
}
// INICIANDO CREATE DO VENOM
venom.create('sessionName').then((client) => start(client));
// FUNCAO START DO CLIENTE DO VENOM BOT
function start(client) {
    // FUNCAO QUE CAPTURA AS MENSAGEM CHEGADAS DO WPP USANDO O VENOM
    client.onMessage(async message => {
        // EXECUTANDO QUERY DIALOGFLOW
        let textoResposta = await executeQueries("kkkkkkkkkkkkk", message.from, [message.body], 'pt-BR')
        // ENVIANDO QUERY RETORNADA
        await client.sendText(message.from, textoResposta);
        //aqui responde mais de uma vez
       
        //aqui envia imagens
        if (textoResposta === 'ok, vamos enviar o cardápio, apos para fazer pedido basta digitar *PEDIDO*' ) { 
          await client
          .sendImage(
            `${message.from}`,
            'img/cardapio5.jpg',
            'cardapio2',
            'Cardápio para fazer seu pedido, digite *Pedido*' )
          .then((result) => {
            console.log('Result: ', result); //return object success
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
          });
        }
        //aqui envia o pdf
        if(textoResposta === 'ok, vamos enviar o pdf'){
          await client
          .sendFile(
            `${message.from}`,
            'Rh.pdf',
            'Rh',
            'veja meu pdf'
          )
          .then((result) => {
            console.log('Result: ', result); //return object success
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
          });
        }
 
        });
}
// FIM DO VENOM BOT


//codigo teste para enviar varias img
/*if (textoResposta === 'ok, vamos enviar o cardápio, apos para fazer pedido basta digitar *PEDIDO*' ) { 
          var img = ['cardapio.jpeg','cardapio2.jpg', 'cardapio3.jpg', 'cardapio4.jpg', 'cardapio5.jpg'];
          var num = 0;
          for ( var i in img ){
          await client
          .sendImage(
            `${message.from}`,
            'img',
            'cardapio',
            'Cardápio' )
          .then((result) => {
            console.log('Result: ', result); //return object success
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro); //return object error
          });}
        }

        */
