#--------------------ИМПОРТ-----------------------------------------------------------------------------------------------

import essentia.standard as es
#from tempfile import TemporaryDirectory
import json
from json import JSONEncoder
import numpy
import argparse
import os
import subprocess




#--------------------ПАРСИНГ-АРГУМЕНТОВ-----------------------------------------------------------------------------------

# !!!загружаемый файл должен иметь частоту 44100 Hz, чтобы значение было максимально точным!!!

# инициализация парсера аргументов
parser = argparse.ArgumentParser()

# аргументы для запуска скрипта
parser.add_argument('-f', '--fileName', help='Название аудио файла')
parser.add_argument('-i', '--intervals', action='store_true', help='Установить, если нужны данные о тактовых интервалах')

# обработка аргументов
args = parser.parse_args()

fileName = args.fileName
intervals = bool(args.intervals)

webmFile = os.getcwd() + "/uploads/" + fileName
mp3File = webmFile.replace("webm", "mp3")

command = f"ffmpeg -i \"{webmFile}\" -vn -ab 128k -ar 44100 -y \"{mp3File}\" -loglevel quiet"
subprocess.call(command, shell=True)

os.remove(webmFile)




#--------------------ВЫЧИСЛЕНИЕ-МУЗЫКАЛЬНЫХ-ХАРАКТЕРИСТИК-----------------------------------------------------------------

# загрузка аудио файла
audio = es.MonoLoader(filename=mp3File)()


# вычисление позиций тактовых импульсов и bpm
# bpm -- число тактовых импульсов в минуту
# beats -- список позиций тактовых импульсов в файлу в секундах
# beats_intervals -- список тактовых интервалов для каждого импульса

rhythm_extractor = es.RhythmExtractor2013(method="degara")
bpm, beats, _, _, beats_intervals = rhythm_extractor(audio)





#--------------------JSON-ПАРСИНГ-ДАННЫХ-И-ЗАПИСЬ-ИХ-В-ФАЙЛ---------------------------------------------------------------

# класс для работы парсера json (сериализации)
class NumpyArrayEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, numpy.ndarray):
            return obj.tolist()
        return JSONEncoder.default(self, obj)

# переменная с сериализированным списком тактовых импульсов
bBeats = json.dumps(beats.tolist(), cls=NumpyArrayEncoder)

# если необходим список тактовых интервалов, заполняем переменную сереализированным списком,
# иначе заполняем переменную null
if intervals:
    bIntervals = numpy.average(beats_intervals)
else: bIntervals = "null"

# запись данных в json
data = {
    "bpm": bpm,
    "beats": bBeats,
    "interval": bIntervals
}

# вывод результата
print(data)

# запись json в файл
#jsonFile = (os.getcwd() + "/parsed_files/" + fileName).replace("webm", "json")
#print(jsonFile)
#with open(jsonFile, "w") as write_file:
#    json.dump(data, write_file)