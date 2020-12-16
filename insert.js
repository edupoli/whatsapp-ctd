const { connection } = require('./conexao');
/*
const mysql = require('mysql');

async function getNumber() {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({ host: '10.0.2.9', user: 'ura', password: 'ask123', database: 'chamados' });
    let num = await connection.execute('SELECT MAX(numero) as numero FROM chamado;');
    return num
}

(async () => {
    let numero = await getNumber();
    console.log(numero);
})();


const getNumber = async () => {
    const connection = mysql.createConnection({
        host: '10.0.2.9',
        port: 3306,
        user: 'ura',
        password: 'ask123',
        database: 'chamados'
    });
    let resultado = await connection.query('SELECT MAX(numero) as numero FROM chamado', function (error, results, fields) {
        if (error) {
            return console.log(error);
        }
        else {
            console.log(results);
            return results[0].numero
        }
    })
    let data = resultado.json();

}

getNumber();
*/
let dados = new Array();
function getResults() {
    return new Promise(function (resolve, reject) {
        connection.query('SELECT MAX(numero) as numero FROM chamado', (err, result) => {
            if (err) return reject(err);
            else return resolve(result);
        });
    });
};
getResults().then(function (result) {
    dados.push(result[0].numero + 1);
    console.log(dados);
});
