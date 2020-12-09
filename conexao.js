const mysql = require('mysql');
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

try {
    oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_19_9' });
} catch (err) {
    console.error('Oracle Instant Client não encontrado!');
    console.error(err);
    process.exit(1);
}

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
                        return callback(null, 0);
                    }

                }
            );
        }
    );
}

function connection_MySQL() {
    return mysql.createConnection({
        host: '10.0.2.9',
        port: 3306,
        user: 'ura',
        password: 'ask123',
        database: 'chamados'
    });
};

//função de conecxao ao MySQL utilizando mysql2 que da suporte nativo a Promise
async function connect() {
    if (global.connection && global.connection.state !== 'disconnected')
        return global.connection;

    const mysql = require("mysql2/promise");       //mysql://usuario:senha@servidor:porta/banco
    const connection = await mysql.createConnection("mysql://ura:ask123@10.0.2.9:3306/chamados");
    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}

function executeSQLQueryParams_MySQL(sql, params, callback) {
    const conn = connection_MySQL();
    conn.query(sql, params, (error, results, fields) => {
        callback(error, results, fields);
        conn.end();
    });
};
function executeSQLQuery_MySQL(sql, callback) {
    const conn = connection_MySQL();
    conn.query(sql, (error, results, fields) => {
        callback(error, results, fields);
        conn.end();
    });
};

exports.connect = connect;
exports.connection_MySQL = connection_MySQL;
exports.executeSQLQuery_MySQL = executeSQLQuery_MySQL;
exports.executeSQLQueryParams_MySQL = executeSQLQueryParams_MySQL;
exports.getUsuario = getUsuario;

