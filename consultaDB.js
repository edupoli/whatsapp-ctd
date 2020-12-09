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
                        return callback(null, false);
                    }

                }
            );
        }
    );
}
exports.getUsuario = getUsuario;