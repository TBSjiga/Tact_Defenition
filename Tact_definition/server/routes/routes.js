// routes.js
// роуты

//--------------------ИМПОРТ-ЗАВИСИМОСТЕЙ----------------------------------------------------------------------------
const Router = require('express');
const router = Router();
const registry = require('./registry.json')




//--------------------ОБРАБОТКА-ВХОДЯЩИХ-ЗАПРОСОВ--------------------------------------------------------------------


//localhost:5000/..apiName../..path..
router.all('/:apiName/:path', (req, res) => {

    // загрузка всех чанков в буфер
    var data = Buffer.from('');

    req.on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
    });

    if (data == undefined || data == null){
        res.send({data: new Date() + ": <API-Gateway> No data!"});
        return;  
    }
          
    console.log(req.params.apiName);
    console.log("_______________________");

    // отправка ответа при получении данных
    req.on('end', () => {

        console.log(new Date())
        console.log("data:");
        console.log(data);

        // перенаправление полученного запроса
        uploadData(data, req);

        res.send({
            data: new Date() + ": <API-Gateway> Data sent!"
        });

    });
    
})





//--------------------ПЕРЕНАПРАВЛЕНИЕ-ЗАПРОСОВ----------------------------------------------------------------------


// отправка данных новым запросом
async function uploadData(body, req) {

    // опции для отправки запроса
    const requestOptions = {
        method: req.method,
        body: body,
        headers: req.headers
    };

    // определение URL на который отправить данные
    if (req.params.apiName == "test-recipient"){
        newURL = req.headers.inputurl;
    }
    if (req.params.apiName == "audio-parser" || req.params.apiName == "react-client"){
        newURL = registry.services[req.params.apiName].url + req.params.path;
    }

    console.log(new Date())
    console.log("newURL:");
    console.log(newURL);


    // отправка fetch запроса
    if (registry.services[req.params.apiName]){
        const response = await fetch(newURL, requestOptions)
        .catch((error) => {
            console.error('Error:', error);
            console.log(new Date())
            console.log("server is down!!"); 
        })

        const {headers, data} = await response.json();

        console.log(new Date());
        console.log("data:");
        console.log(data);

    }else{
        res.send("API Name doesn't exist.");
    }

}


module.exports = router