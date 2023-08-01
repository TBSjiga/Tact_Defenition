// audioParser.js
// анализатор аудио

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
const { stdout } = require("process");

app.use(express.static('uploads'));
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

if ('development' == app.get('env')) {
    console.log("Rejecting node tls");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}





//--------------------ВЫБОР-ПОРТА-И-БАЗОВОГО-URL---------------------------------------------------------------------

const port = process.env.PORT || 5001;

const baseURL = 'https://localhost:5000';





//--------------------ОБРАБОТКА-ЗАПРОСА------------------------------------------------------------------------------


// функция поиска bpm, тактовых импульсов и (опционально) тактоого интервала
// запускает python-скрипт, находящий с помощью библиотеки essentail на c++ 
// параметры аудио-файла .mp3
// если нужно найти тактовые импульсы, то добавляем параметр -i


// POST для загрузки аудио буфера
app.post("/upload-audio", (request, response) => {
 
    // загрузка всех чанков в буфер
    let data = Buffer.from('');

    request.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
    });

    if (data == undefined || data == null){
        response.send({data: new Date() + ": <Audio-Parser> No data!"});
    }else{
        
        // когда ответ полностью получен
        request.on('end', () => {

            // записываем буфер в файл .webm и сохраняем его имя
            let fileName = bufferToFile(data);

            // записываем значение чекбокса на отправку тактового интервала
            let check = request.headers.checked;

            // записываем значение URL
            let inputURL = request.headers.inputurl;

            console.log(new Date())
            console.log("check:");
            console.log(check);
            
            if (check == "true") 
                var tInterval = '-i';
            else 
                var tInterval = '';


            // строка запуска скрипта
            scriptRun = `python3 bpmTracker.py -f ${fileName} ${tInterval}`

            console.log(new Date())
            console.log("scriptRun:");
            console.log(scriptRun);


            // синхронный вызов дочернего процесса с запуском скрипта
            // перехватывает вывод из оболочки и сохраняет его в child
            const execSync = require('child_process').execSync;
            var child = execSync(`${scriptRun}`, (error, stdout, stderr) => {

                if (error) {
                    console.error(`exec error: ${error}`);
                    return;
                }else{
                
                    var fileBeatName = stdout;

                    console.log(`stdout: ${stdout}`);
                    console.error(`stderr: ${stderr}`);

                    return fileBeatName;
                }
            });


            // получение результата
            var result = child.buffer;

            if (result == undefined || result == null){
                // отправка ответа
                response.send({data: new Date() + ": <Audio-Parser> No data!"});
                return;
            }

            // отправка ответа
            response.send({data: new Date() + ": <Audio-Parser> Data for analysis sent"});

            //отправлка результата на введенный URL
            sendResult(result, inputURL)
        });
    }
}); 





//--------------------ЗАПИСЬ-БУФЕРА-В-ФАЙЛ---------------------------------------------------------------------------

// функция записи буфера в файл
function bufferToFile(buffer){
  
    console.log(new Date())
    console.log("buffer:");
    console.log(buffer);

    let dateFileName = Date.now() + ".webm"
    fs.writeFileSync(__dirname + "/uploads/" + dateFileName, buffer, function(err) {
        if(err) {
            console.log(err);
            return;
        } else {
            console.log("The file was saved!");
        }
    });

    return dateFileName;

}





//--------------------ОТПРАВКА-РЕЗУЛЬТАТА-АНАЛИЗА--------------------------------------------------------------------

// асинхронная функция отправки результата анализа на заданный URL
async function sendResult(result, url){

    console.log(new Date())
    console.log("result:");
    console.log(result);

    // установка кастомных заголовков
    const myHeaders = new Headers();
    myHeaders.append("inputurl", `${url}`);


    // параметры запроса
    const requestOptions = {
        method: 'POST',
        body: result,
        headers: myHeaders
    };


    // fetch post запрос на отправку результата по URL
    const response = await fetch(baseURL + "/test-recipient/upload-result", requestOptions)
    .catch((error) => {
        console.error('Error:', error);
        console.log(new Date())
        console.log("Server is down!!"); 
    })

    
    //ожидание ответа
    try{

        let {headers, data} = await response.json();
        console.log(new Date());
        console.log("Response:");
        console.log(data);

    }catch{
        console.log("No response");
    }

}
 




//--------------------СЕРТИФИКАЦИЯ-И-ЗАПУСК-СЕРВЕРА------------------------------------------------------------------

// создание объекта с ключом и сертификатом ssl
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

// запуск сервера и прослушивание указанного порта 
https.createServer(options, app)
.listen(port, function (req, res) {
    console.log(`Listening on port ${port}`);
});