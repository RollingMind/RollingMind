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
    const length = 6;  //초대 코드 길이
    min = Math.pow(10, length - 1);
    max = Math.pow(10, length) - 1;

    return new Promise(async (resolve, reject) => {
        let code;

        do {
            code = Math.floor(Math.random() * (max - min + 1)) + min;  //랜덤 숫자 생성
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
            } else if (results.length === 0) {  //중복 X
                resolve(false);
            } else {  //중복 O
                resolve(true);
            }
        });
    });
}

app.post('/create-room', (request, response)=>{
    date = new Date();

    if(new Date(request.body.release_date) <= date && request.body.release_date !== null){  
        return response.status(400).json({ error: '지난 날짜는 선택할 수 없습니다.' });
    };

    sql = `INSERT INTO rollingpaper_room (host_id, title, public, release_date, introduction, template_color, template_image, room_id, participation_request, participant_list) VALUES ('${request.body.host_id}', '${request.body.title}', '${request.body.public}', '${request.body.release_date}', '${request.body.introduction}', '${request.body.template_color}', '${request.body.template_image}', ${request.body.room_id}, '${request.body.participation_request}', '${JSON.stringify(request.body.participant_list)}')`;
    insertRoomInfo(sql);

    response.status(200).send({
    });
});

function insertRoomInfo(sql) {  //데이터베이스에 방 정보 저장

    db.query(sql, function (error, results, fields) {
        if (error) console.error(error);
        console.log(results);
    });

    db.query("SELECT * FROM rollingpaper_room", function (error, results, fields) {
        if (error) {
            console.error(error);
            response.status(500).send("테이블 조회 오류");
        } else {
            console.log(results);
        }
    });
};

app.listen(port, () => {
    console.log(`${port}번 포트에서 서버 실행 중`);
});