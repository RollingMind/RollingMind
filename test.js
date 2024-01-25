const express = require('express');
const app = express();
const port = 3000

app.get('/', (req, res) => res.send('Hello World!'))

// 서버 실행
app.listen(3000, () => {
  console.log('서버가 3000번 포트에서 실행 중입니다.');
});