// test_resipient
// тестовый получатель результата

//--------------------ИМПОРТ-ЗАВИСИМОСТЕЙ----------------------------------------------------------------------------


// https сервер
const https = require("https");

// express
const express = require('express'); 
const app = express();

// cors для доступа к ресурсам сервера
const cors = require('cors');

// fs для работы с локальными файлами
const fs = require("fs");

// парсинг форм
const bodyParser = require("body-parser");

app.use(express.static('uploads'));
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if ('development' == app.get('env')) {
    console.log("Rejecting node tls");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}





//--------------------ВЫБОР-ПОРТА------------------------------------------------------------------------------------


const port = process.env.PORT || 7000;





//--------------------ОБРАБОТКА-ЗАПРОСА------------------------------------------------------------------------------

  
// POST для получения данных
app.post("/", (request, response) => {

    let data = Buffer.from('');
    
    // загрузка всех чанков в буфер
    request.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
    });

    if (data == undefined || data == null){
        response.send({data: new Date() + ": <Test_recipient> No data!"});
        return;  
    }

    // когда ответ полностью получен
    request.on('end', () => {
        
        // преобразуем ответ в json
        const result = new TextDecoder("utf-8").decode(new Uint8Array(data));
        
        //console.log(result);
        var resultJson = JSON.stringify(eval("(" + result + ")"));
        //console.log(resultJson);

        // вывод в удобном для просмотра формате
        console.log("data: \nbpm -- bits per second, \nbeats -- list of bit locations in seconds, \ninterval -- interval between bits in seconds.");
        //console.log(typeof(resultJson));
        console.log(JSON.parse(resultJson));
        
        // отправка ответа
        response.send({
            data: "Data sent"
        });

        //uploadData(data, req);
    });
});




//--------------------СЕРТИФИКАЦИЯ-И-ЗАПУСК-СЕРВЕРА------------------------------------------------------------------


// создание объекта с ключом и сертификатом ssl
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

// Сообщение о том, что сервер запущен и прослушивает указанный порт 
https.createServer(options, app)
.listen(port, function (req, res) {
    console.log(`Listening on port ${port}`);
});