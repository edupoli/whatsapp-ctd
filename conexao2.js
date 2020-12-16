const mysql = require('mysql');

let numero = new Array();

let pool = mysql.createPool({
    connectionLimit: 20,
    host: '10.0.2.9',
    port: 3306,
    user: 'ura',
    password: 'ask123',
    database: 'chamados'
});

function executeSQLQueryParams(sql, params) {
    pool.getConnection(function (err, conn) {
        if (err) throw err; // not connected!

        conn.beginTransaction((error) => {
            if (error) {
                console.log('Ocorreu um erro durante a gravação no banco de dados MySQL \n', error);
            }
            else {
                conn.query(sql, params, (error, results, fields) => {
                    if (error) {
                        conn.rollback(function () {
                            console.log('Ocorreu um erro durante a gravação no banco de dados MySQL \n', error);
                        });
                    }
                    else {

                        console.log(sql);
                        conn.commit(function (error) {
                            if (error) {
                                console.log('Ocorreu um erro durante a gravação no banco de dados MySQL \n', error);
                            }
                            else {
                                console.log('Dados inseridos com sucesso !!');
                            }
                        })
                    }
                    conn.query('SELECT * FROM chamado WHERE id = ?', results.insertId, (error, result) => {
                        if (error) {
                            console.log(error);
                        }
                        else {
                            numero.push(result[0].numero)
                        }
                    })
                    conn.release();
                });
            }
        })
    })
}

function executeSQLQueryTwoTables(sql, params) {

    conn.beginTransaction((error) => {
        if (error) {
            console.log('Ocorreu um erro durante a gravação no banco de dados MySQL \n', error);
        }
        else {
            conn.query(sql, params, (error, results, fields) => {
                if (error) {
                    conn.rollback(function () {
                        console.log('Ocorreu um erro durante a gravação no banco de dados MySQL \n', error);
                    });
                }
                else {
                    conn.commit(function (error) {
                        if (error) {
                            console.log('Ocorreu um erro durante a gravação no banco de dados MySQL \n', error);
                        }
                        else {
                            console.log('Dados inseridos com sucesso !!');
                        }
                    })
                }
                conn.query('SELECT * FROM chamado WHERE id = ?', results.insertId, (error, result) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        numero.push(result[0].numero)
                        conn.destroy();
                    }
                })
            });
        }
    })
}
exports.executeSQLQueryParams = executeSQLQueryParams;
exports.numero = numero;
    /*
executeSQLQuery: function (sql, callback) {
const conn = this.connection();
conn.query(sql, (error, results, fields) => {
callback(error, results, fields);
conn.end();
});
}
*/

