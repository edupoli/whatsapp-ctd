const Whatsapp = require('venom-bot');
let dados = require('./dados');
const con = require('./conexao');
const fs = require('fs');
const mime = require('mime-types');
const path = require('path');
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
            disableWelcome: true,
            updatesLog: false,
            autoClose: 60000,
            createPathFileToken: true,
        })
    .then((client) => start(client))
    .catch((erro) => { console.log(erro) });

Whatsapp.defaultLogger.level = 'error';

function start(client) {
    client.onMessage(async (message) => {
        if (typeof message != "undefined") {
            client.startTyping(message.from);
        }
        if (getStage(message.from) === 11) {

        }
        //console.log(message);
        if (getStage(message.from) === 0 && message.isGroupMsg === false) {
            client.sendText(message.from,
                'Seja bem vindo ao sistema de 🛠️ Suporte de Informática da CTD 🖥️ \n' +
                'Por favor informe seu RE'
            );
            let data = new Date();
            var telefone = ((String(`${message.from}`).split('@')[0]).substr(2));
            dados[message.from].itens.push(data.toLocaleString(), 'ABERTO', telefone);
            dados[message.from].stage = 1;
            console.log("Estagio " + dados[message.from].stage);
            console.log(getItens(message.from));
            return
        }

        if (getStage(message.from) === 1 && message.isGroupMsg === false) {
            if (isNaN(message.body) == true) {
                client.sendText(message.from, '❌ *RE invalido*, deve conter apenas numeros!');
                return
            }
            else {
                var query = "SELECT * FROM agenda WHERE re = :id";
                con.getUsuario(query, [message.body], function (err, result) {
                    if (!err) {
                        if (result === 0) {
                            client.sendText(message.from, 'RE *não cadastrado*, por favor verifique e tente novamente!');
                            return
                        }
                        else {
                            dados[message.from].stage = 2;
                            dados[message.from].itens.push(result[0].RE, result[0].NOME, result[0].RAMAL, result[0].EMAIL, result[0].SETOR);
                            console.log("Estagio " + dados[message.from].stage);
                            console.log(getItens(message.from));
                            client.sendText(message.from,
                                '*RE:* ' + result[0].RE + '\n' +
                                '*Nome:* ' + result[0].NOME + '\n' +
                                '*Ramal:* ' + result[0].RAMAL + '\n' +
                                '*e-mail:* ' + result[0].EMAIL + '\n' +
                                '*Setor:* ' + result[0].SETOR + '\n\n' +
                                'Esta correto ? \n Digite #️⃣ para *confirmar* ou *️⃣  para *informar outro* RE'
                            );
                            return
                        }
                    }
                });
            }
        }

        if (getStage(message.from) === 2 && message.isGroupMsg === false) {
            if ((message.body.length >= 1) && ((message.body != "#") && (message.body != "*"))) {
                client.sendText(message.from, "❌ Opção inválida, Responda #️⃣ para confirmar ou *️⃣ para alterar");
                return
            }
            if (message.body === "*") {
                dados[message.from].stage = 1;
                dados[message.from].itens.splice(3, 7);
                console.log("Estagio " + dados[message.from].stage);
                console.log(getItens(message.from));
                client.sendText(message.from, "Por favor redigite seu numero do RE");
                return
            }
            if (message.body === "#") {
                dados[message.from].stage = 3;
                console.log("Estagio " + dados[message.from].stage);
                console.log(getItens(message.from));
                client.sendText(message.from,
                    `Sobre qual assunto você deseja atendimento ? \n` +
                    `Por favor *escolha uma opção:*\n\n` +
                    `*MENU PRINCIPAL*\n` +
                    `⚒️ *1* - Abertura de Chamado. \n` +
                    `🔍 *2* - Consultar Chamado. \n` +
                    `🔥 *3* - Dificuldade de Acesso a Sistemas. \n` +
                    `🔑 *4* - Alteração de Senhas. \n` +
                    `☎️ *5* - Telefonia. \n` +
                    `🧠 *6* - Machine Learning e Inteligência Artificial. \n` +
                    `🔎 *7* - Consultar Ramais. \n` +
                    `✍🏼 *8* - Criticas ou Elogios. \n\n\n` +

                    `A qualquer momento durante a navegação pelos Menus, envie a palavra *VOLTAR* \n` +
                    `para retornar ao *Menu Anterior* e envie *SAIR* para finalizar o atendimento`
                );
                return
            }
        }
        if (getStage(message.from) === 3 && message.body === "6") {
            dados[message.from].stage = 11;
            client.sendText(message.from, 'Nesta opção voce pode fazer uma pergunta qualquer \n' +
                'Para voltar ao menu inicial digite #️⃣'
            )
            return
        }
        if (getStage(message.from) === 11 && message.body != '#') {
            let textoResposta = await executeQueries("teste-qrscuw", message.from, [message.body], 'pt-BR')
            await client.sendText(message.from, textoResposta);
        }
        if (getStage(message.from) === 11 && message.body === '#') {
            dados[message.from].stage = 3;
            client.sendText(message.from,
                `Sobre qual assunto você deseja atendimento ? \n` +
                `Por favor *escolha uma opção:*\n\n` +
                `*MENU PRINCIPAL*\n` +
                `⚒️ *1* - Abertura de Chamado. \n` +
                `🔍 *2* - Consultar Chamado. \n` +
                `🔥 *3* - Dificuldade de Acesso a Sistemas. \n` +
                `🔑 *4* - Alteração de Senhas. \n` +
                `☎️ *5* - Telefonia. \n` +
                `🧠 *6* - Machine Learning e Inteligência Artificial. \n` +
                `🔎 *7* - Consultar Ramais. \n` +
                `✍🏼 *8* - Criticas ou Elogios. \n\n\n` +

                `A qualquer momento durante a navegação pelos Menus, envie a palavra *VOLTAR* \n` +
                `para retornar ao *Menu Anterior* e envie *SAIR* para finalizar o atendimento`
            );
            return
        }

        if (getStage(message.from) === 3 && message.body === "1") {
            dados[message.from].stage = 4;
            dados[message.from].itens.push(message.body);
            console.log("Estagio " + dados[message.from].stage);
            console.log(getItens(message.from));
            client.sendText(message.from,
                "*ABERTURA DE CHAMADO* \n\n" +
                "Faça a descrição da sua Solicitação"
            );
            return
        }
        if (getStage(message.from) === 4) {
            dados[message.from].stage = 5;
            dados[message.from].itens.push(message.body);
            console.log("Estagio " + dados[message.from].stage);
            console.log(getItens(message.from));
            client.sendText(message.from,
                "*Descrição da Solicitação* \n\n"
                + message.body + "\n\n" +
                "Por favor revise o texto, estando tudo certo digite *SIM* " +
                "Para confirmar 👍🏼,\n ou Caso queira refazer o texto digite *DELETAR* 👎🏼"
            );
            return
        }
        if (getStage(message.from) === 5) {
            let msg = message.body;
            if ((msg.toLowerCase() != "sim") && (msg.toLowerCase() != "deletar")) {
                client.sendText(message.from,
                    "❌ Opção inválida, Responda *SIM* para confirmar 👍🏼 ou *DELETAR* para alterar 👎🏼"
                );
                return
            }
            if (msg.toLowerCase() === "deletar") {
                dados[message.from].stage = 4;
                dados[message.from].itens.pop();
                console.log("Estagio " + dados[message.from].stage);
                console.log(getItens(message.from));
                client.sendText(message.from,
                    "Faça a descrição da sua Solicitação novamente"
                );
                return
            }
            if (msg.toLowerCase() === "sim") {
                dados[message.from].stage = 6;
                console.log("Estagio " + dados[message.from].stage);
                console.log(getItens(message.from));
                client.sendText(message.from,
                    "Para facilitar o atendimento, você pode nos enviar arquivos de midias " +
                    "como fotos  📷  e videos 🎞️\n Alem de documentos nos formatos PDF 🧾 Word 📄 ou Excel 📊 \n\n" +
                    "É simples e pratico 🙂 \n" +
                    "Você deseja enviar algum arquivo neste chamado ? \n" +
                    "Responda *SIM* 👍🏼 ou *NÂO* 👎🏼 \n\n" +
                    "Ahh só lembrando que a função do arquivo é nos ajudar a intender o problema.\n" +
                    "*Exemplo:* Uma foto da tela com uma mensagem de erro ja nos ajuda bastante 😉"
                );
                return
            }
        }

        if (getStage(message.from) === 6) {
            let msg = message.body;
            if ((msg.toLowerCase() != "sim") && (msg.toLowerCase() != "não" && msg.toLowerCase() != "nao")) {
                client.sendText(message.from,
                    "❌ Opção inválida, Responda *SIM* para confirmar 👍🏼 ou *NÃO* para não enviar arquivos 👎🏼"
                );
                return
            }
            if (msg.toLowerCase() === "nao" || msg.toLowerCase() === "não") {
                dados[message.from].stage = 7;
                console.log("Estagio " + dados[message.from].stage);
                console.log(getItens(message.from));
                client.sendText(message.from,
                    "✅ Ok tudo certo para abertura do seu chamado 👋🏼👋🏼\n" +
                    "Digite #️⃣ para confirmar ou *️⃣  caso não queira mais abrir o chamado."
                );
                return
            }
            if (msg.toLowerCase() === "sim") {
                dados[message.from].stage = 8;
                console.log("Estagio " + dados[message.from].stage);
                console.log(getItens(message.from));
                client.sendText(message.from,
                    "👋🏼👋🏼 Otimo vamos lá agora pode enviar 😉"
                );
                return
            }
        }

        if (getStage(message.from) === 7) {
            if ((message.body.length >= 1) && ((message.body != "#") && (message.body != "*"))) {
                client.sendText(message.from,
                    "❌ Opção inválida, Responda #️⃣ para confirmar ou *️⃣ para cancelar"
                );
                return
            }
            if (message.body === "#") {
                var data = new Array(getItens(message.from));
                con.pool.getConnection(function (err, connection) {
                    if (err) throw err; // not connected!
                    connection.beginTransaction(function (err) {
                        if (err) {
                            throw err;
                        }
                        else {
                            let sql = 'INSERT INTO chamado(numero, data_abertura,' +
                                ' status, num_whatsapp, re, nome, ramal, email, setor,' +
                                ' opcao_menu, descricao) select max(numero) + 1 as numero, ? FROM chamado';
                            connection.query(sql, data, (err, results) => {
                                if (err) {
                                    connection.rollback(function () {
                                        throw err;
                                    });
                                }
                                if (results) {
                                    connection.query('SELECT * FROM chamado WHERE id = ?', results.insertId, function (err, result) {
                                        dados[message.from].chamadoId = result[0].numero;
                                    })
                                }
                                connection.release();
                            });
                            connection.commit(function (err) {
                                if (err) {
                                    connection.rollback(function () {
                                        throw err;
                                    });
                                }
                                else {
                                    client.sendText(message.from,
                                        `👏🏻👏🏻 Seu Chamado foi aberto com Sucesso e registrado com Nº *${getChamadoId(message.from)}* ✅ ` +
                                        `A equipe de informática irá analisar e respondera o mais breve possivel.\n` +
                                        `Voce podera acompanhar o andamento da solicitação , com o numero do chamado ` +
                                        `Na *Opção 2* do Menu Principal.\n\n\n` +
                                        `Agradecemos por utilzar nossos serviços.\n\n` +
                                        `👋🏼👋🏼 Ate logo.`
                                    );
                                    dados[message.from].stage = 0;
                                    dados[message.from].chamadoId.pop();
                                    while (dados[message.from].itens.length > 0) {
                                        dados[message.from].itens.pop();
                                    }
                                }
                                console.log('success!');
                            });
                        }
                    });
                })
            }
            if (message.body === "*") {
                dados[message.from].stage = 0;
                while (dados[message.from].itens.length > 0) {
                    dados[message.from].itens.pop();
                }
                console.log("Estagio " + dados[message.from].stage);
                console.log(getItens(message.from));
                client.sendText(message.from,
                    "🚫 A Solicitação foi Cancelada \n" +
                    "Obrigado por utilizar nosso atendimento Virtual."
                );
                return
            }
        }

        if (getStage(message.from) === 8) {

            if ((message.body.length >= 1) && (message.body === "!")) {
                dados[message.from].stage = 7;
                console.log("Estagio ", dados[message.from].stage);
                console.log("Itens ", getItens(message.from));
                console.log("Midias ", getMidias(message.from));
                client.sendText(message.from,
                    "✅ Ok tudo certo para abertura do seu chamado 👋🏼👋🏼\n" +
                    "Digite #️⃣ para confirmar ou *️⃣  caso não queira mais abrir o chamado."
                );
                return
            }
            if (message.type === "chat") {
                client.sendText(message.from,
                    "❌ Ops!! nesta fase do atendimento *só recebo arquivos*\n" +
                    "Por favor enviar um arquivo. \n\n" +
                    "Caso tenha desistido de enviar um arquivo digite ❗"
                );
                return
            }
            if (message.isMedia === true || message.isMMS === true) {

                let msgId = await message.id.toString();
                dados[message.from].messageId.push(msgId);
                const buffer = await client.decryptFile(message);
                //const buffer = await client.downloadMedia(message);
                var telefone = ((String(`${message.from}`).split('@')[0]).substr(2));
                let date_ob = new Date();
                let date = ("0" + date_ob.getDate()).slice(-2);
                let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
                let year = date_ob.getFullYear();
                let miliseconds = date_ob.getMilliseconds();
                const fileName = `${telefone}` + "-" + `${year}` + `${month}` + `${date}` + "-" + `${miliseconds}`
                const file = `${fileName}.${mime.extension(message.mimetype)}`;
                fs.writeFile(`./midias_recebidas/${file}`, buffer, (err) => {
                    if (!err) {
                        dados[message.from].midias.push(file);
                        dados[message.from].stage = 9;
                        console.log(getStage(message.from));
                        console.log(getMidias(message.from));
                        client.reply(message.from,
                            "Arquivo de Midia foi recebido com Sucesso !! ✅ \n" +
                            "Caso queira deletar o arquivo enviado digite *DELETAR* \n" +
                            "Para enviar mais arquivos digite #️⃣ \n" +
                            "Para concluir o envio de Arquivos digite 🆗",
                            message.id.toString()
                        );
                        return
                    }
                });
            }
        }
        if (getStage(message.from) === 9) {
            let msg = message.body;
            if (msg.toLowerCase() === "deletar") {
                let file = dados[message.from].midias.slice(-1).toString();
                fs.unlink(`./midias_recebidas/${file}`, (error) => {
                    if (error) {
                        console.log('Erro ao deletar o arquivo', error);
                        client.sendText(message.from, "Erro ao tentar deletar o arquivo\n\n" + error + "\n");
                    }
                    else {
                        client.reply(message.from, "❌ O arquivo foi deletado ! 👆🏼👆🏼", dados[message.from].messageId.slice(-1).toString());
                        client.sendText(message.from,
                            "Para enviar outro arquivo digite #️⃣ \n" +
                            "Para concluir o envio de Arquivos digite 🆗"
                        );
                        dados[message.from].messageId.pop();
                        dados[message.from].midias.pop();
                        console.log(getMidias(message.from));
                    }
                })
            }
            if (msg.length >= 1 && msg === "#") {
                client.sendText(message.from,
                    "👋🏼👋🏼 Otimo vamos lá agora pode enviar mais 😉"
                );
                dados[message.from].stage = 8;
                return
            }
            if (msg.length = 2 && msg.toLowerCase() === "ok") {
                dados[message.from].stage = 10;
                console.log("Estagio ", dados[message.from].stage);
                console.log("Itens ", getItens(message.from));
                console.log("Midias ", getMidias(message.from));
                client.sendText(message.from,
                    "✅ Ok tudo certo para abertura do seu chamado 👋🏼👋🏼\n" +
                    "Digite #️⃣ para confirmar ou *️⃣  caso não queira mais abrir o chamado."
                );
                return
            }
        }
        if (getStage(message.from) === 10) {
            if ((message.body.length >= 1) && ((message.body != "#") && (message.body != "*"))) {
                client.sendText(message.from,
                    "❌ Opção inválida, Responda #️⃣ para confirmar ou *️⃣ para cancelar"
                );
                return
            }
            if (message.body === "#") {
                var data = [getItens(message.from)];
                var midias = [getMidias(message.from)];
                con.pool.getConnection(function (err, connection) {
                    if (err) throw err; // not connected!
                    connection.beginTransaction(function (err) {
                        if (err) {
                            throw err;
                        }
                        else {
                            connection.query('INSERT INTO chamado(numero, data_abertura,' +
                                ' status, num_whatsapp, re, nome, ramal, email, setor,' +
                                ' opcao_menu, descricao) select max(numero) + 1 as numero, ? FROM chamado', data, function (err, result) {
                                    if (err) {
                                        connection.rollback(function () {
                                            throw err;
                                        });
                                    }
                                    var lastID = result.insertId;
                                    midias.forEach(element => {
                                        connection.query(`INSERT INTO midias(chamadoID, nome_arquivo) VALUES (${lastID}, ?)`, element, function (err, result) {
                                            if (err) {
                                                connection.rollback(function () {
                                                    throw err;
                                                });
                                            }
                                        });
                                    });
                                    connection.query('SELECT * FROM chamado WHERE id = ?', lastID, function (err, result) {
                                        dados[message.from].chamadoId.push(result[0].numero);
                                    })
                                    connection.release();
                                });
                            connection.commit(function (err) {
                                if (err) {
                                    connection.rollback(function () {
                                        throw err;
                                    });
                                }
                                else {
                                    client.sendText(message.from,
                                        `👏🏻👏🏻 Seu Chamado foi aberto com Sucesso e registrado com *Nº ${getChamadoId(message.from)}*  ✅ ` +
                                        `A equipe de informática irá analisar e respondera o mais breve possivel.\n` +
                                        `Voce podera acompanhar o andamento da solicitação , com o numero do chamado ` +
                                        `Na *Opção 2* do Menu Principal.\n\n\n` +
                                        `Agradecemos por utilzar nossos serviços.\n\n` +
                                        `👋🏼👋🏼 Ate logo.`
                                    );
                                    dados[message.from].stage = 0;
                                    dados[message.from].chamadoId.pop();
                                    while (dados[message.from].itens.length > 0) {
                                        dados[message.from].itens.pop();
                                    }
                                    while (dados[message.from].midias.length > 0) {
                                        dados[message.from].midias.pop();
                                    }
                                }
                                console.log('Gravado com sucesso!');
                            });
                        }
                    });
                });
            }
            if (message.body === "*") {
                dados[message.from].stage = 0;
                while (dados[message.from].itens.length > 0) {
                    dados[message.from].itens.pop();
                }
                while (dados[message.from].midias.length > 0) {
                    dados[message.from].midias.pop();
                }
                console.log("Estagio " + dados[message.from].stage);
                console.log(getItens(message.from));
                client.sendText(message.from,
                    "🚫 A Solicitação foi Cancelada \n" +
                    "Obrigado por utilizar nosso atendimento Virtual."
                );
                return
            }
        }
        if (typeof message != "undefined") {
            client.stopTyping(message.from);
        }
    });
    client.onStateChange((state) => {
        console.log('State changed: ', state);
        if ('CONFLICT'.includes(state)) client.useHere();
        if ('UNPAIRED'.includes(state)) console.log('logout');
    });

    client.onIncomingCall(async (call) => {
        console.log(call);
        client.sendText(call.peerJid, "Desculpe eu não atendo chamadas");
    });
}

function getStage(user) {
    if (dados[user]) {
        return dados[user].stage;
    }
    else {
        dados[user] = {
            stage: 0,
            itens: [],
            midias: [],
            chamadoId: [],
            messageId: [],
        };
        return dados[user].stage;
    }
}
function getItens(user) {
    if (dados[user]) {
        return dados[user].itens;
    }
    else {
        dados[user] = {
            stage: 0,
            itens: [],
            midias: [],
            chamadoId: [],
        };
        return dados[user].itens;
    }
}
function getMidias(user) {
    if (dados[user]) {
        return dados[user].midias;
    }
    else {
        dados[user] = {
            stage: 0,
            itens: [],
            midias: [],
            chamadoId: [],
        };
        return dados[user].midias;
    }
}
function getChamadoId(user) {
    if (dados[user]) {
        return dados[user].chamadoId;
    }
    else {
        dados[user] = {
            stage: 0,
            itens: [],
            midias: [],
            chamadoId: [],
        };
        return dados[user].chamadoId;
    }
}
