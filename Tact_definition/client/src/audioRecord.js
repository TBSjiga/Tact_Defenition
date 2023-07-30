// audioRecord.js
// запись звука

//--------------------ИМПОРТ-ЗАВИСИМОСТЕЙ----------------------------------------------------------------------------


import React, {useRef, useState} from 'react';
import logo from './logo.svg';

// окно ошибки
import InputError from './Modal/InputError'





//--------------------МОДУЛЬ-ЗАПИСИ-АУДИО---------------------------------------------------------------------------


function AudioRecord() {





//--------------------ХУКИ-И-ВАЖНЫЕ-КОНСТАНТЫ-----------------------------------------------------------------------

    
    // mime тип для записи звука
    const mimeType = "audio/webm";

    //const [result, setResult] = useState("Записи нет") // результат действия
    const [checkSendInterval, setCheckSendInterval] = useState(false); // чекбокс на отправку интервала
    const [inputURL, setInputURL] = useState(""); // инпут URL
    const [permission, setPermission] = useState(false); // разрешение на использование микро
    const [stream, setStream] = useState(null); // звковой поток
    const mediaRecorder = useRef(null); // держит данные от создания нового объекта медиа энкодера
    const [recordingStatus, setRecordingStatus] = useState("inactive"); // статус записи (recording, inactive)
    const [audioChunks, setAudioChunks] = useState([]); // аудио чанки (куски потока)
    const [audioWebm, setAudioWebm] = useState(null); // аудио webm
    //const [audio, setAudio] = useState(null); // аудио (содержит блоб юрл готовой записи)
    const [modalActive, setModalActive] = useState(false); // состояние модального окна ошибки

    // регулярное выражение для проверки URL
    const urlPattern = new RegExp(/((http|https|ftp):\/\/)*([a-zA-Z0-9:]*)/g);

    // сохранение записанного input
    const inputChange = event => {
        setInputURL(event.target.value);
    }
    
    // базовый URL для отправки запросов
    const baseURL = 'https://localhost:5000';





//--------------------РАЗРЕШЕНИЕ-НА-ИСПОЛЬЗОВАНИЕ-МИКРОФОНА--------------------------------------------------------
    

    // функция разрешения использования микрофона
    const getMicrophonePermission = async () => {
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                alert(err.message);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };




//--------------------ЗАПИСЬ-ЗВУКА---------------------------------------------------------------------------------


    // функция начала записи
    const startRecording = async () => {
        setRecordingStatus("recording");

        // создание нового MediaRecorder для записи стрима
        const media = new MediaRecorder(stream, { type: mimeType });
        mediaRecorder.current = media;

        // вызов метода start для запуска процесса записи
        mediaRecorder.current.start();

        // создание локальных чанков
        let localAudioChunks = [];

        // запись данных аудио с микрофона в аудиочанк
        mediaRecorder.current.ondataavailable = (event) => {
           if (typeof event.data === "undefined") return;
           if (event.data.size === 0) return;
           localAudioChunks.push(event.data);
        };

        // сохранение аудиочанка
        setAudioChunks(localAudioChunks);
    };





//--------------------ОКОНЧАНИЕ-ЗАПИСИ-ЗВУКА-----------------------------------------------------------------------


    // функция окончания записи
    const stopRecording = () => {
        setRecordingStatus("inactive");

        // окончание записи 
        mediaRecorder.current.stop();

        // действия при окончании записи
        mediaRecorder.current.onstop = () => {

            // создание блоба из сохраненных аудиочанков
            const audioBlob = new Blob(audioChunks, { type: mimeType });

            console.log("audioBlob:");
            console.log(audioBlob);

            // созранение блоба
            setAudioWebm(audioBlob);

            // создание url для запуска аудио блоб
            //const audioUrl = URL.createObjectURL(audioBlob);
            //setAudio(audioUrl);

            // обнуляем аудио чанки для новой записи
            setAudioChunks([]);
        };
    };




//--------------------ОТПРАВКА-ЗАПИСИ-------------------------------------------------------------------------------


    // обработка кнопки отправки записи на сервер апи
    async function sendFile(){

        if (!urlPattern.test(inputURL) == true){
            setModalActive(true);
        }else{
            
            // установка кастомных заголовков
            const myHeaders = new Headers();
            myHeaders.append("checked", `${checkSendInterval}`);
            myHeaders.append("inputurl", `${inputURL}`);

            // параметры запроса
            const requestOptions = {
                method: 'POST',
                body: audioWebm,
                headers: myHeaders
            };

            // fetch post запрос серверу анализа аудио-данных с записанным буфером
            const response = await fetch(baseURL + '/audio-parser/upload-audio', requestOptions)
            .catch((error) => {
                console.error('Error:', error);
                console.log("server is down!!")   
            });
            
            //ожидание ответа
            const {headers, data} = await response.json();
            
            console.log(new Date());
            console.log("data:");
            console.log(data);

        }
        
    }




//--------------------JSX-СТРАНИЦЫ----------------------------------------------------------------------------------
    return (
        <>
            <div className="file-upload">
                
                <h1 id="name">Определитель такта</h1>

                <p className='description'>Это сервис, позволяющий определить такт музыки.<br></br>
                    Он анализирует запись, определяя тактовые импульсы,<br></br>
                    расчитывает интервал между ними, и определяет bpm.<br></br>
                </p>

                <p className='description'>Принцип работы:<br></br>
                    1. Выбор необходимости отправки списка тактового<br></br>
                    интервала между каждыми тактовыми импульсами.<br></br>
                    2. Ввод URL-адресса, куда необходимо отправить данные.<br></br>
                    3. Разрешение записи звука с микрофона устройства.<br></br>
                    4. Запись звука с микрофона.<br></br>
                    5. Загрузка записи на сервер и его анализ.<br></br>
                    6. Получение данных о такте музыки по заданному URL.<br></br>
                </p>

                <p className='description'>Ограничения.<br></br>
                Поддерживаемые браузеры: Chrome, Opera, Edge.<br></br>
                    Качество работы сервиса на остальных браузерах не гарантируется.<br></br>
                    Запись ведется с частотой 44.1 kHz для лучшей работы анализатора.<br></br>
                    Рекомендуемое время записи - от 15 секунд до 5 минут.<br></br>
                    Чем дольше запиь звука, тем лучше выборка, тем лучше результат.<br></br>
                    Результат будет лучше там, где такт определяется битом или басом.<br></br>
                    Качество результата не гарантируется в сложных композициях.<br></br>
                </p>
                
                <div className="parameters">

                    {permission ? (

                        <h2 id="reg">Выбор параметров</h2>
                    ) : null}
                    
                    <div className="chk">

                    {permission ? (
                        <p>Отправить тактовый интервал?</p>
                    ) : null}

                    {permission ? (
                        <label>
                            <input id="checkInput" 
                                type="checkbox" 
                                checked={checkSendInterval} 
                                onChange={() => setCheckSendInterval(!checkSendInterval)}/>
                        </label>
                    ) : null}

                    </div>

                    <div className="chk">

                        {permission ? (
                            <p>Введите URL-адресс для отправки данных:</p>
                        ) : null}

                        {permission ? (
                            <label>
                                <input id="url" type="url" placeholder="https://localhost:3000" 
                                value={inputURL} pattern="https://.*" onChange={inputChange}/>
                            </label>
                        ) : null}

                    </div>
                </div>
                
                <div className="audio-controls">
                    {!permission ? (
                    <button className="upbutton" onClick={getMicrophonePermission} type="button">
                        Понятно.<br></br>Начать пользовться.
                    </button>
                    ) : null}

                    {permission && recordingStatus === "inactive" ? (
                    <button id="startRecord" className="upbutton" onClick={startRecording} type="button">
                        Начать запись
                    </button>
                    ) : null}

                    {recordingStatus === "recording" ? (
                    <>
                        <button id="stopRecord" className="upbutton" onClick={stopRecording} type="button">
                            Закончить запись
                        </button>
                        <p>{recordingStatus}</p>
                        <img src={logo} className="App-logo" alt="logo" />
                    </>
                    
                    ) : null}

                </div>
                
                {audioWebm ? (
                    <div className="audio-container">
                        {/* <audio src={audio} controls></audio>
                        <a download href={audio}>
                            Скачать запись
                        </a> */}

                        <button id="sendFile" className="upbutton" onClick={sendFile} type="button">
                            Загрузить
                        </button>

                    </div>
                ) : null}

            </div>

            <InputError active={modalActive} setActive={setModalActive}>
                <p id='error'>Неверная запись URL!</p>
            </InputError>
        </>
    );
}

export default AudioRecord;
