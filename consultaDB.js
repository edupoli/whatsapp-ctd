const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
try {
    oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_12_2' });
} catch (err) {
    console.error('Oracle Instant Client não encontrado!');
    console.error(err);
    process.exit(1);
}

//FUNÇÃO DE CONSULTA AO BANCO DE DADOS ORACLE UTILIZANDO CALLBACK
function getUsuario(query, params, callback) {

    oracledb.getConnection({
        user: "askint",
        password: 'askint',
        connectString: "bcprod-scan.ASKBCLDA.LOCAL/bcprod"
    },
        function (err, connection) {
            if (err) {
                console.log(err.message);
                return callback(err);
            }
            connection.execute(
                query, params,
                function (err, result) {
                    if (err) {
                        console.log(err.message);
                        return callback(err);
                    }
                    if (result.rows.length > 0) {
                        return callback(null, result.rows);
                    } else {
                        return callback(null, false);
                    }

                }
            );
        }
    );
}
exports.getUsuario = getUsuario;

// CHAMADA DA FUNÇÃO getUsuario
var query = "select * from agenda where re=:id";
getUsuario(query, [5594], function (err, result) {
    if (!err) {
        if (result === false) {
            console.log("não encontrou")
        } else {
            console.log(result[0].NOME) //chamando um item do objeto
            console.log(result); // chamado o objeto completo
        }
    }
});

//FUNÇÃO DE CONSULTA AO BANCO DE DADOS ORACLE UTILIZANDO PROMISSE
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

getFuncionario(6903); // CHAMADA DA FUNÇÃO 
exports.getFuncionario = getFuncionario;