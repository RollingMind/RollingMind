const express = require('express');
const app = express();
const port = 3000
const mysql = require('mysql');
const connction = mysql.createConnection({
  host : 'localhost',
  user : 'test',
  password : '1111',
  database : 'test'
});



app.get('/', (req, res) => res.send('Hello World!'))

// 서버 실행
app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});

connction.connect();

connction.query('Select * from Users', (error, rows, fields) => {
  if (error) throw error;
  console.log('User info is: ', rows);
});

connction.end();