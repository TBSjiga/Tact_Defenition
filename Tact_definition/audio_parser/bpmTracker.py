#!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!ВАЖНО!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

# Для анализа записанного звука используется библиотека essentia. Ее установка описана на их офф. сайте: 
# https://essentia.upf.edu/installing.html

# Так как essentia не поддерживает формат webm, а браузеры записывают звук только в этом формате, 
# то также используется конвертер FFmpeg для преобразования из webm в mp3.
# Установка FFmpeg описана на их офф. сайте:
# https://ffmpeg.org/download.html

# Так как весь функционал библиотеки FFmpeg не нужен, для экономии места на диске при конфигурации были прописаны такие параметры:
# --disable-everything --disable-network --disable-autodetect --enable-small --enable-protocol='file,pipe' 
# --enable-demuxer=matroska --enable-muxer=mp3 --enable-decoder='vorbis,opus' --enable-encoder=libmp3lame --enable-libmp3lame 
# --extra-ldflags=-L/usr/local/lib --extra-cflags=-I/usr/local/include --enable-filter=aresample






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

# запись имени файла и значения необходимости отправки интервала из аргументов
fileName = args.fileName
intervals = bool(args.intervals)

# запись путей к .webm и .mp4 файлам
webmFile = os.getcwd() + "/uploads/" + fileName
mp3File = webmFile.replace("webm", "mp3")

# преобразование .webm в .mp4 для анализа
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

# если необходим тактовый интервал, заполняем переменную,
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