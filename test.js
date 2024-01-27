const express = require('express');

const mysql = require('mysql');
const dbconfig = require('../RollingMind/database.js');
const connction = mysql.createConnection(dbconfig);

const app = express();

app.set('port', process.env.PORT || 3000);

app.get('/', (req, res) => {
  res.send('Root');
})

app.get('/users', (req, res) => {
  connction.query('Select * from Users', (error, rows, fields) => {
    if (error) throw error;
    console.log('User info is: ', rows);
    res.send(rows);
  });
});

app.listen(app.get('port'), () => {
  console.log('Express server listening on port ' + app.get('port'));
});


