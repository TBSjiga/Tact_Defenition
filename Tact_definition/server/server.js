// server.js
// API-Gateway

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

// роуты
const routes = require('./routes/routes');


//--------------------ВЫБОР-ПОРТА-----------------------------------------------------------------------------------


const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', routes);

if ('development' == app.get('env')) {
  console.log("Rejecting node tls");
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}





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