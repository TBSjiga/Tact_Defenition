# Tact_Defenition
Алексеев Д.А.<br>
Сервис определения такта аудио, записанного с микрофона устройства.<br>

Это сервис, позволяющий определить такт музыки.<br>
Он анализирует запись, определяя тактовые импульсы, расчитывает интервал между ними, и определяет bpm.<br>
Для анализа аудио-файла используется С++ библиотека Essentia с инициализацией с помощью языка Python.<br>

Принцип работы:<br>
1. Выбор необходимости отправки списка тактового интервала между каждыми тактовыми импульсами.<br>
2. Ввод URL-адресса, куда необходимо отправить данные.<br>
3. Разрешение записи звука с микрофона устройства.<br>
4. Запись звука с микрофона.<br>
5. Загрузка записи на сервер и его анализ.<br>
6. Получение данных о такте музыки по заданному URL.<br>

Ограничения:<br>
Поддерживаемые браузеры: Chrome, Opera, Edge.
Качество работы сервиса на остальных браузерах не гарантируется.
Запись ведется с частотой 44.1 kHz для лучшей работы анализатора.
Рекомендуемое время записи - от 15 секунд до 60 секунд.
Чем дольше запиь звука, тем лучше выборка, тем лучше результат.
Результат будет лучше там, где такт определяется битом или басом.
Качество результата не гарантируется в сложных композициях.

## Структура сервиса

![Tact_Defenition drawio](https://github.com/TBSjiga/Tact_Defenition/assets/31573154/bc41dbd9-f757-42b0-b156-f3ae1ec8b51b)


## Демонстрация работы сервиса

https://github.com/TBSjiga/Tact_Defenition/assets/31573154/8b2becd9-1212-4b80-86b6-88470207ac4b

## Стек используемых технологий

- VS Code
- JavaScript
- NodeJS
- Express
- React
- Essentia
- Python
- C++
