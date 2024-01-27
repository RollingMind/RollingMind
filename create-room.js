const express = require('express');
const app = express();
const port = 3000;
const db = require('./lib/crdb');

app.use(express.json());

app.get('/create-room', async (request, response) => {
    const inviteCode = await generateRoomId(); //초대 코드
    response.json({ invite_code: inviteCode });
});

function generateRoomId() {  //방 아이디(초대 코드) 생성
    const length = 6;  // 초대 코드 길이
    min = Math.pow(10, length - 1);
    max = Math.pow(10, length) - 1;

    return new Promise(async (resolve, reject) => {
        let code;

        do {
            code = Math.floor(Math.random() * (max - min + 1)) + min;  // 랜덤 숫자 생성
        } while (await check_room_id(code));

        resolve(code);
    });
}

function check_room_id(code) {  //방 아이디 중복 체크
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM rollingpaper_room WHERE room_id = ${code}`, function (error, results, fields) {
            if (error) {
                console.log(error);
                reject(error);
            } else if (results.length === 0) {  // 중복 X
                resolve(false);
            } else {  // 중복 O
                resolve(true);
            }
        });
    });
}

app.listen(port, () => {
    console.log(`${port}번 포트에서 서버 실행 중`);
});