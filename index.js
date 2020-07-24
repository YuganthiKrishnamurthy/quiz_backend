var mysql = require('mysql2');
var Client = require('ssh2').Client;
var ssh = new Client();
const express = require('express');
const app = express();
app.use(express.json());
const cors = requre('cors');
app.use(cors());
/* db connection*/
var db = new Promise(function (resolve, reject) {
    ssh.on('ready', () => {
        ssh.forwardOut('127.0.0.1', 3306, 'db.cs.dal.ca', 3306, function (err, stream) {
            if (err) throw err;
            db = mysql.createConnection({
                host: 'db.cs.dal.ca',
                user: 'yuganthi',
                password: 'B00839935',
                port: 3306,
                database: 'yuganthi',
                stream: stream
            });
            db.connect(function (err) {
                console.log('MYSQL Connected');
                if (err) {
                    resolve(db);
                } else {
                    reject(err);
                }
            });
            app.listen(3000, () => console.log('listening on port 3000....'));
            /* get request for all jobs*/
            app.get('/api/yuganthi', (req, res) => {
                db.query('select * from questions', (err, rows, fields) => {
                    if (!err) {
                        let questionSet = [];
                        for(var j =0;j<rows.length;j++){
                            let question = {
                                questionId:null,
                                question:null,
                                options:[],
                                selectedOption:false,
                                type:null
                            }
                            question.questionId = rows[j].qid;
                            question.question = rows[j].question;
                            question.type = rows[j].choiceType;
                            var strLines = rows[j].choices.split(';');
                            for(var i in strLines) {
                                var obj = JSON.parse(strLines[i]);
                                obj.id = parseInt(obj.id)
                                question.options.push(obj)
                            }
                            questionSet.push(question)
                        }
                        res.send(questionSet);
                    }
                    else
                        res.send(err);
                })
            });
        });
    }).connect({
        host: 'bluenose.cs.dal.ca',
        username: 'yuganthi',
        port: 22,
        password: 'B00839935'
    });
}).catch((err) => { if (err) throw err });
