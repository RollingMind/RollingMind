const { response } = require('express');
const express = require('express');
const app = express();
const port = 3000;
const db = require('./lib/crdb');

app.use(express.json());

app.get('/create-room', async (request, response) => {
    var inviteCode = await generateRoomId(); //초대 코드
    var like_template_list = await getLikeTemplate(request.body.host_id);  //좋아요 누른 템플릿 리스트

    response.json({
        invite_code: inviteCode,
        template_list: like_template_list
    });
});

async function generateRoomId() {  //방 아이디(초대 코드) 생성
    const length = 6;  //초대 코드 길이
    min = Math.pow(10, length - 1);
    max = Math.pow(10, length) - 1;
    let code;

    do {
        code = Math.floor(Math.random() * (max - min + 1)) + min; // 랜덤 숫자 생성
    } while (await check_room_id(code));
    
    return code;
}

async function check_room_id(code) {  //방 아이디 중복 체크
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

function getLikeTemplate(id){  //좋아요 누른 템플릿 가져오기
    sql = `SELECT like_template_list FROM user WHERE id = '${id}'`; 
    return new Promise((resolve, reject) => {
        db.query(sql, function (error, results, fields) {
            if (error) {
              reject({ error: '템플릿 불러오기 실패' });
            } else {
              resolve(results);
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
        host_id: request.body.host_id,
        title: request.body.title,
        public: request.body.public,
        release_date: request.body.release_date,
        template_color: request.body.template_color,
        template_image: request.body.template_image,
        room_id: request.body.room_id,
        participation_request: request.body.participation_request,
        participant_list: request.body.participant_list
    });
});

function insertRoomInfo(sql) {  //데이터베이스에 방 정보 저장
    db.query(sql, function (error, results, fields) {
        if (error) response.status(500).json({ error: '방 저장 오류' });
    });
}

app.get('/create-room/add-participant', async (request, response) => {
    friend_list = await getFriendsList(request.body.id);
    response.status(200).json({
        friend_list: friend_list
    });
});

function getFriendsList(id){  //친구 목록 조회
    sql = `SELECT friend_list FROM user WHERE id = '${id}'`;
    return new Promise((resolve, reject) => {
        db.query(sql, function (error, results, fields) {
            if (error) {
              reject({ error: '친구 목록 불러오기 실패' });
            } else {
              resolve(results);
            }
        });
    });
}

app.listen(port, () => {
    console.log(`${port}번 포트에서 서버 실행 중`);
});