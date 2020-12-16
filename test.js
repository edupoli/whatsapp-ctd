/*
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

function getFuncionario(id) {
    return new Promise(async function (resolve, reject) {
        let connection;

        try {
            connection = await oracledb.getConnection({
                user: "askint",
                password: 'askint',
                connectString: "bcprod-scan.ASKBCLDA.LOCAL/bcprod"
            });

            const result = await connection.execute(`SELECT * FROM agenda WHERE re = :id`, [id]);
            if (result.rows.length > 0) {
                console.log("Result is:", result.rows);
                var string = JSON.stringify(result.rows);
                var dados = JSON.parse(string);
                console.log(dados[0].NOME);
                return dados
            } else {
                console.log("Não foram encontrados registros ")
            }

        } catch (err) {
            reject(err);
        } finally {
            if (connection) {
                try {
                    await connection.release();
                } catch (e) {
                    console.error(e);
                }
            }
        }
    });
}

//getFuncionario(6903);
exports.getFuncionario = getFuncionario;




async function getResults(id) {
    return new Promise(async function (resolve, reject) {
        await connection.execute('SELECT * FROM cad_usuario WHERE cd_re = :id', [id], (error, result) => {
            if (error) return reject(error);
            else return resolve(result);
        });
    });
};
let response = await getResults().then(async function (result) {
    var dados = (`Resultado da Pesquisa \n\n` +
        `*Nome:* ` + result[0].NM_USUARIO + `\n` +
        `*RE:* ` + result[0].CD_RE + `\n` +
        `*Descrição:* ` + result[0].RAMAL);
    // console.log(dados);
    return [dados];
});
console.log(response);
return response;

getResults(1742);
*/
const mysql = require('mysql');

connection = mysql.createConnection({
    host: '10.0.2.9',
    port: 3306,
    user: 'ura',
    password: 'ask123',
    database: 'chamados'
});

const results = sqlQuery()

function sqlQuery() {
    return new Promise((resolve, reject) => {
        connection.query('SELECT MAX(numero) as numero FROM chamado', function (error, results, fields) {
            if (error) {
                console.log(error)
                //Rejeita a promessa
                reject(error)
            }
            connection.end()
            //Conclui a promessa
            resolve(results)
        })
    })
}

//console.log(results.numero) // Promise
results.then(r) // Os valores
console.log(r)