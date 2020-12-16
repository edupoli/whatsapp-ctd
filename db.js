/*
var fs = require('fs'),
    request = require('request');

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

download('https://web.whatsapp.com/pp?e=https%3A%2F%2Fpps.whatsapp.net%2Fv%2Ft61.24694-24%2F69767577_979425935820014_6969913915986361313_n.jpg%3Foh%3D75ddcef9d85723a5229e1229d1c08570%26oe%3D5FDDE5AD&t=l&u=554396611437%40c.us&i=1579525855&n=G6HHl%2BP0YrSjY56yxUn9WOFtih%2FlxHefSNGemDegTSg%3D', 'google.jpg', function () {
    console.log('done');
});
*/
const http = require("http");
const fs = require("fs");

function download(url) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(__dirname, { flags: "wx" });

        const request = http.get(url, response => {
            if (response.statusCode === 200) {
                response.pipe(file);
            } else {
                file.close();
                fs.unlink(__dirname, () => { }); // Delete temp file
                reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
            }
        });

        request.on("error", err => {
            file.close();
            fs.unlink(__dirname, () => { }); // Delete temp file
            reject(err.message);
        });

        file.on("finish", () => {
            resolve();
        });

        file.on("error", err => {
            file.close();

            if (err.code === "EEXIST") {
                reject("File already exists");
            } else {
                fs.unlink(__dirname, () => { }); // Delete temp file
                reject(err.message);
            }
        });
    });
}

var urll = 'http://web.whatsapp.com/pp?e=https%3A%2F%2Fpps.whatsapp.net%2Fv%2Ft61.24694-24%2F69767577_979425935820014_6969913915986361313_n.jpg%3Foh%3D75ddcef9d85723a5229e1229d1c08570%26oe%3D5FDDE5AD&t=l&u=554396611437%40c.us&i=1579525855&n=G6HHl%2BP0YrSjY56yxUn9WOFtih%2FlxHefSNGemDegTSg%3D';
var dir = './';
download(urll, dir)