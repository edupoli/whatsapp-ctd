const Whatsapp = require('venom-bot');
let dados = require('./dados');
const con = require('./conexao');
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');

Whatsapp.create('API-Whatsapp',

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
  }
).then((client) => {
  start(client);
}).catch((erro) => {
  console.log(erro);
});

function start(client) {
  client.onMessage(async (message) => {
    if (getStage(message.from) === 0) {
      client
        .sendText(message.from, 'Seja bem vindo ao sistema de 🛠️ Suporte de Informática da CTD 🖥️ \n' +
          'Por favor informe seu RE')
        .then((result) => {
          dados[message.from].stage = 1;
          console.log("Estagio " + dados[message.from].stage);
          var telefone = ((String(`${message.from}`).split('@')[0]).substr(2));
          dados[message.from].itens.push(telefone);
          console.log(getItens(message.from));
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro);
        });
    }
    if (getStage(message.from) === 1) {
      if (isNaN(message.body) == true) {
        client
          .sendText(message.from, '❌ *RE invalido*, deve conter apenas numeros!')
          .then((result) => {
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      } else {
        var query = "select * from agenda where re=:id";
        con.getUsuario(query, [message.body], function (err, result) {
          if (!err) {
            if (result === false) {
              client
                .sendText(message.from, 'RE *não cadastrado*, por favor verifique e tente novamente!')
                .then((result) => {
                })
                .catch((erro) => {
                  console.error('Error when sending: ', erro);
                });
            } else {
              dados[message.from].stage = 2;
              dados[message.from].itens.push(result[0].RE, result[0].NOME, result[0].EMAIL, result[0].SETOR);
              console.log("Estagio " + dados[message.from].stage);
              console.log(getItens(message.from));
              client
                .sendText(message.from, '*RE:* ' + result[0].RE + '\n' +
                  '*Nome:* ' + result[0].NOME + '\n' +
                  '*Ramal:* ' + result[0].RAMAL + '\n' +
                  '*e-mail:* ' + result[0].EMAIL + '\n' +
                  '*Setor:* ' + result[0].SETOR + '\n\n' +
                  'Esta correto ? \n Digite #️⃣ para *confirmar* ou *️⃣  para *informar outro* RE')
                .then((result) => {

                })
                .catch((erro) => {
                  console.error('Error when sending: ', erro);
                });
            }
          }
        });
      }
    }
    if (getStage(message.from) === 2) {
      if ((message.body.length >= 1) && ((message.body != "#") && (message.body != "*"))) {
        client
          .sendText(message.from, "❌ Opção inválida, Responda #️⃣ para confirmar ou *️⃣ para alterar")
          .then((result) => {
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      }
      if (message.body === "*") {
        dados[message.from].stage = 1;
        dados[message.from].itens.splice(1, 5);
        console.log("Estagio " + dados[message.from].stage);
        console.log(getItens(message.from));

        client
          .sendText(message.from, "Por favor redigite seu numero do RE")
          .then((result) => {
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      }
      if (message.body === "#") {
        dados[message.from].stage = 3;
        console.log("Estagio " + dados[message.from].stage);
        console.log(getItens(message.from));
        client
          .sendText(message.from, `Sobre qual assunto você deseja atendimento ? \n` +
            `Por favor *escolha uma opção:*\n\n` +
            `*MENU PRINCIPAL*\n` +
            `⚒️ *1* - Abertura de Chamado. \n` +
            `🔥 *2* - Dificuldade de Acesso a Sistemas. \n` +
            `🔑 *3* - Alteração de Senhas. \n` +
            `☎️ *4* - Telefonia. \n` +
            `🧠 *5* - Machine Learning e Inteligência Artificial. \n` +
            `🔎 *5* - Consultar Ramais. \n` +
            `✍🏼 *6* - Criticas ou Elogios. \n\n\n` +

            `A qualquer momento durante a navegação pelos Menus, envie a palavra *VOLTAR* \n` +
            `para retornar ao *Menu Anterior* e envie *SAIR* para finalizar o atendimento`)
          .then((result) => {
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      }
    }
    if (getStage(message.from) === 3 && message.body === "1") {
      client
        .sendText(message.from, "*ABERTURA DE CHAMADO* \n\n" + "Faça a descrição da sua Solicitação")
        .then((result) => {
          dados[message.from].stage = 4;
          dados[message.from].itens.push(message.body);
          console.log("Estagio " + dados[message.from].stage);
          console.log(getItens(message.from));
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro);
        });
    }
    if (getStage(message.from) === 4) {
      client
        .sendText(message.from, "*Descrição da Solicitação* \n\n"
          + message.body +
          "\n\nPor favor revise o texto, estando tudo certo digite 🆗\n" +
          "Caso queira refazer o texto digite *DELETAR*")
        .then((result) => {
          dados[message.from].stage = 5;
          dados[message.from].itens.push(message.body);
          console.log("Estagio " + dados[message.from].stage);
          console.log(getItens(message.from));
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro);
        });
    }
    if (getStage(message.from) === 5) {
      let msg = message.body;
      console.log(msg);
      if ((msg.toLowerCase() != "ok") && (msg.toLowerCase() != "deletar")) {
        client
          .sendText(message.from, "❌ Opção inválida, Responda 🆗 para confirmar ou *DELETAR**️⃣ para alterar")
          .then((result) => {
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      }
      if (msg.toLowerCase() === "deletar") {
        dados[message.from].stage = 4;
        dados[message.from].itens.pop();
        console.log("Estagio " + dados[message.from].stage);
        console.log(getItens(message.from));
        client
          .sendText(message.from, "Faça a descrição da sua Solicitação novamente")
          .then((result) => {
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      }
      if (msg.toLowerCase() === "ok") {
        dados[message.from].stage = 6;
        console.log("Estagio " + dados[message.from].stage);
        console.log(getItens(message.from));
        client
          .sendText(message.from, "Para facilitar o atendimento você pode nos enviar arquivos de midias " +
            "como fotos 📷 e videos 📹 alem de documentos PDF ou Word ou Excel.")
          .then((result) => {
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      }
    }
    if (getStage(message.from) === 3) {
      if (message.isMedia === true || message.isMMS === true) {
        const buffer = await client.decryptFile(message);
        var telefone = ((String(`${message.from}`).split('@')[0]).substr(2));
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let miliseconds = date_ob.getMilliseconds();
        const fileName = `${telefone}` + "-" + `${year}` + `${month}` + `${date}` + "-" + `${miliseconds}`
        const file = `${fileName}.${mime.extension(message.mimetype)}`;
        let diretorio = (path.join(__dirname, "/midias_recebidas"));
        diretorio = diretorio + "\\" + file;

        await fs.writeFile(diretorio, file, buffer, (err) => {
          if (!err) {
            dados[message.from].midias = file;
            dados[message.from].stage = 4;
            console.log(getMidias(message.from));

            client
              .sendText(message.from, "Arquivo de Midia foi recebido com Sucesso !! ✅ \n" +
                "Caso queira deletar o arquivo enviado digite *DELETAR* \n" +
                "Para enviar mais arquivos digite ➕ \n" +
                "Para concluir o envio de Arquivos digite 🆗")
              .then((result) => {
              })
              .catch((erro) => {
                console.error('Error when sending: ', erro);
              });
          }
        });
      }
    }
    if (getStage(message.from) === 4) {
      let msg = message.body;
      if (msg.toLowerCase() === "deletar") {
        await client
          .deleteMessage(message.chatId, message.id.toString(), true, (err) => {
            if (!err) {
              //await fs.unlink
            }
          })
          .then((result) => {
            console.log('Result: ', result);
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      }
    }
  });

  client.onStateChange((state) => {
    console.log('State changed: ', state);
    if ('CONFLICT'.includes(state)) client.useHere();
    if ('UNPAIRED'.includes(state)) console.log('logout');
  });
};


function getStage(user) {
  if (dados[user]) {
    return dados[user].stage;
  } else {
    dados[user] = {
      stage: 0,
      itens: [],
      midias: [],
    };
    return dados[user].stage;
  }
}

function getItens(user) {
  if (dados[user]) {
    return dados[user].itens;
  } else {
    dados[user] = {
      stage: 0,
      itens: [],
      midias: [],
    };
    return dados[user].itens;
  }
}

function getMidias(user) {
  if (dados[user]) {
    return dados[user].midias;
  } else {
    dados[user] = {
      stage: 0,
      itens: [],
      midias: [],
    };
    return dados[user].midias;
  }
}