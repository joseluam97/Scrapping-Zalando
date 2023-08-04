from datetime import datetime
#from airflow import DAG
#from airflow.operators.python_operator import PythonOperator
from discordwebhook import Discord
import cfscrape
import json
import time
import colorama
from bs4 import BeautifulSoup

from types import ModuleType
from inspect import currentframe, getmodule
import sys
import urllib.request
import pandas as pd
import requests

colorama.init()

REQUESTS_MANAGER = cfscrape.CloudflareScraper()
GET = REQUESTS_MANAGER.get
POST = REQUESTS_MANAGER.post
JSON_TO_TABLE = json.loads
TABLE_TO_JSON = json.dumps
COLOR = colorama.Fore

DISCORD_BASIC_LOGGING = False

LOGGING_WEBHOOK = 'https://discord.com/api/webhooks/1111330702353518683/A-1GbjNAXqvdGnCLflrS-zuvNha1Jyoavwc2TSrNca5WuTNhAhCmkoa-nzqLFXIKIGMJ'

WEBHOOKS = [
    # You can add as many webhooks as u want, diving them with ","
    'https://discord.com/api/webhooks/1111330702353518683/A-1GbjNAXqvdGnCLflrS-zuvNha1Jyoavwc2TSrNca5WuTNhAhCmkoa-nzqLFXIKIGMJ',
]

#LINK = 'https://www.zalando.es/calzado-hombre/nike_amarillo.lila.verde/?order=price&dir=asc'
#LINK = 'https://www.zalando.es/calzado-hombre/nike_amarillo.beige.lila.verde/'
#LINK = 'https://www.zalando.es/calzado-hombre/adidas.nike/'
LINK = 'https://www.zalando.es/calzado-hombre/'

COUNTRY_LINKS = {
    'IT': 'https://www.zalando.es/calzado-hombre/nike/',
    'UK': 'https://www.zalando.es/calzado-hombre/nike/'
}

COUNTRY_BASE_URL = {
    'IT': 'https://www.zalando.es/calzado-hombre/nike/',
    'UK': 'https://www.zalando.es/calzado-hombre/nike/'
}

LOGGING_COLORS = {
    "INFO": COLOR.CYAN,
    "LOG": COLOR.BLUE,
    "WARNING": COLOR.YELLOW,
    "ERROR": COLOR.RED,
}

def log(logType, message, details):
    logDate = str(datetime.now())

    logFile = open('logs.log', 'a+')

    if len(details) == 0:
        logFile.write(logDate + ' [%s] ' % (logType) + message + '\n')
        #print(logDate + LOGGING_COLORS[logType] + ' [%s] ' % (logType) + message + COLOR.RESET)
    else:
        logFile.write(logDate + ' [%s] ' % (logType) +
                      message + ' | ' + TABLE_TO_JSON(details) + '\n')
        #print(logDate + LOGGING_COLORS[logType] + ' [%s] ' % (logType) + message + ' | ' + TABLE_TO_JSON(details) + COLOR.RESET)

    logFile.close()

    detailsString = ''

    if (logType == 'LOG') and (DISCORD_BASIC_LOGGING == False):
        return

    for x in details:
        detailsString += '`%s = %s`\n' % (str(x), details[x])

    data = {
        "content": None,
        "embeds": [
            {
                "color": None,
                "fields": [
                    {
                        "name": "LOG TYPE",
                        "value": "`%s`" % (logType)
                    },
                    {
                        "name": "LOG MESSAGE",
                        "value": "`%s`" % (message)
                    },
                    {
                        "name": "LOG DETAILS",
                        "value": detailsString
                    },
                    {
                        "name": "TIME",
                        "value": "`%s`" % (logDate)
                    }
                ]
            }
        ],
        "username": "Zalando Scraper Logs",
        "avatar_url": "https://avatars.githubusercontent.com/u/1564818?s=280&v=4"
    }

    if len(details) == 0:
        data['embeds'][0]['fields'].remove(data['embeds'][0]['fields'][2])

    POST(LOGGING_WEBHOOK, json=data)


def save_external_articles(content):
    file = open('articles.json', 'w+')
    file.write(TABLE_TO_JSON(content))
    file.close()
    return content


def load_external_articles():
    open('articles.json', 'a+')
    file = open('articles.json', 'r')
    fileContent = file.read()
    if len(fileContent) < 2:
        save_external_articles([])
        return []
    try:
        file.close()
        return JSON_TO_TABLE(fileContent)
    except:
        save_external_articles([])
        return []


def validate_country(countryCode):
    return not (COUNTRY_LINKS[countryCode] == None)

def adjust_articles_info(content, countryCode):
    adjustedArticlesList = []
    for article in content:
        articleInfo = {}
        rSplit = article['availability']['releaseDate'].split(' ')
        rDate = rSplit[0].split('-')
        rTime = rSplit[1]
        articleInfo['zalandoId'] = article['id']
        articleInfo['releaseDate'] = '%s-%s-%s %s' % (
            rDate[2], rDate[1], rDate[0], rTime)
        articleInfo['productName'] = article['brand'] + ' ' + article['name']
        articleInfo['originalPrice'] = article['price']['original']
        articleInfo['currentPrice'] = article['price']['current']
        articleInfo['link'] = "%s%s.html" % (
            COUNTRY_BASE_URL[countryCode], article['urlKey'])
        articleInfo['imageUrl'] = article['imageUrl']

        adjustedArticlesList.append(articleInfo)

    return adjustedArticlesList


def compare_articles(articles):
    if len(oldArticles) == 0:
        return articles
    else:
        if len(articles) == len(oldArticles):
            return []
        else:
            articlesToReturn = []
            for article in articles:
                found = False

                for article_ in oldArticles:

                    if article['zalandoId'] == article_['zalandoId']:
                        found = True

                if found == False:
                    articlesToReturn.append(article)

            return articlesToReturn


def get_product_stock(link):
    response = GET(link)
    bs = BeautifulSoup(response.content, 'html.parser')
    sizeArray = []
    try:
        sizeArray = JSON_TO_TABLE(bs.find("script", {'id': 'z-vegas-pdp-props'}).contents[0][9:-3])['model']['articleInfo']['units']
    except:
        log('ERROR','Could not retrieve model units and sizes',{'URL' : link})

    sizeStockArray = []
    for x in sizeArray:
        sizeStockArray.append({
            'size': x['size']['local'],
            'sizeCountry': x['size']['local_type'],
            'stock': x['stock']
        })

    return sizeStockArray


def get_page_data(countryCode):

    if validate_country(countryCode):
        response = GET(COUNTRY_LINKS[countryCode])
        if response.status_code == 200:
            return response.content
        else:
            log('ERROR', 'Error while retrieving page',
                {'statusCode': response.status_code})
            return {'error': 'Invalid Status Code', 'status_code': response.status_code}
    log('ERROR', 'Invalid Country (get_page_data)',
        {'countryCode': countryCode})
    return {'error': 'Invalid Country'}

def filter_json(content):

    vectorArticulos = []
    soup = BeautifulSoup(content, "html.parser")

    # Encontrar todos los elementos que contienen información de los productos
    product_items = soup.find_all("article", class_="z5x6ht _0xLoFW JT3_zV mo6ZnF _78xIQ-")
    
    # Iterar sobre cada producto y extraer los datos relevantes
    for item in product_items:
        
        # Extraer el nombre del producto
        name = item.find("h3", class_="KxHAYs lystZ1 FxZV-M HlZ_Tf ZkIJC- r9BRio qXofat EKabf7 nBq1-s _2MyPg2")
        
        # Extraer la marca del producto
        brand = item.find("h3", class_="_6zR8Lt lystZ1 FxZV-M HlZ_Tf ZkIJC- r9BRio qXofat EKabf7 nBq1-s _2MyPg2")
        
        # Extraer el precio del producto
        price = None
        price1 = item.find_all("span", class_="ZiDB59 r9BRio uVxVjw")
        price2 = item.find_all("p", class_="KxHAYs lystZ1 FxZV-M HlZ_Tf")
        price3 = item.find_all("span", class_="KxHAYs lystZ1 dgII7d Km7l2y")

        if price1 != None and len(price1) == 1:
            price = price1[0]
        if price2 != None and len(price2) == 1:
            price = price2[0]
        if price3 != None and len(price3) == 1:
            price = price3[0]

        # Extraer el link de la imagen del producto
        imagen = item.find("img", class_="KxHAYs lystZ1 FxZV-M _2Pvyxl JT3_zV EKabf7 mo6ZnF _1RurXL mo6ZnF _7ZONEy")

        # Extraer el link del producto
        link = item.find("a", class_="_LM JT3_zV CKDt_l CKDt_l LyRfpJ")

        if brand != None and price != None and name != None:
            brand_cadena = brand.text.strip()
            price_cadena = price.text.strip()
            name_cadena = name.text.strip()
            #link_cadena = link.text.strip()
            imagen_cadena = imagen['src']
            link_cadena = link['href']

            if price_cadena.find("desde") != -1:
                print("Precio no valido")
            else:
                elemento = {
                    "name": name_cadena,
                    "brand": brand_cadena,
                    "imagen": imagen_cadena,
                    "link": link_cadena
                }

                #POST O GET DEL ZAPATO DEPENDIENDO SI EXISTE O NO
                dato_zapato = post_or_get_zapato(elemento)
                
                #REGISTRO DEL PRECIO ACTUAL
                post_price(dato_zapato, price_cadena)


    
    return vectorArticulos

def post_price(dato_zapato, price_cadena):
    cadena_sin_simbolo = price_cadena.replace("€", "").replace("\xa0", "")
    price = float(cadena_sin_simbolo.replace(",", "."))
    # URL del endpoint donde realizarás la solicitud POST
    url = "http://localhost:3100/prices"

    #Creacion del json
    newPrice = {
        "idProducto": dato_zapato["_id"],
        "price": price
    }

    # Realizar la solicitud POST para comprobar la existencia del elemento
    response = requests.post(url, json=newPrice)

    # Verificar la respuesta
    if response.status_code == 200:
        print("Registro del precio de manera existosa")
        send_last_line("Se ha registrado un nuevo precio para el zapato: " + dato_zapato["name"] + ", el cual ha sido: "+ str(price))
    else:
        print("!ERROR¡")
        send_last_line("ERROR en el registro del precio del zapato: " + dato_zapato["name"] + ", con el precio: "+ str(price))

def post_or_get_zapato(elemento):
    # URL del endpoint donde realizarás la solicitud POST
    url = "http://localhost:3100/productos/byName/"

    # Realizar la solicitud POST para comprobar la existencia del elemento
    response = requests.post(url, json={"name": elemento["name"]})

    # Verificar la respuesta
    if response.status_code == 200:
        data = response.json()
        #Verificar si existen datos existentes
        if len(data) == 0:
            #No existe
            #Creacion del elemento en BD
            elemento_created = add_element_BD(elemento)
            return elemento_created
        else:
            #Existe
            return data[0]


def add_element_BD(elemento):
    # URL del endpoint donde realizarás la solicitud POST
    url = "http://localhost:3100/productos"

    # Realizar la solicitud POST
    response = requests.post(url, json=elemento)

    # Verificar la respuesta
    if response.status_code == 200:
        print("Producto creado exitosamente.")
        send_last_line("Se ha registrado un nuevo zapato: " + elemento["name"])
        return response.json()
    else:
        return None

def send_message(content):

    for article in content:

        for webhook in WEBHOOKS:

            #log('LOG', 'Article Message Sent', {'WEBHOOK': webhook, 'ARTICLE-ID': article['name']})
            #cadena_mensaje = article['brand'] + " - " + article['name'] + " - " + article['price']
            cadena_mensaje = article['brand'] + " - " + article['name']
            #POST(webhook, content=cadena_mensaje)

            discord = Discord(url=webhook)
            discord.post(content=cadena_mensaje)

def send_last_line(cadena_enviar):

    for webhook in WEBHOOKS:
        cadena_mensaje = cadena_enviar

        discord = Discord(url=webhook)
        discord.post(content=cadena_mensaje)

def get_data_by_page(pageSelect):
    url_page = LINK + '?p=' + str(pageSelect)
    response = GET(url_page)
    if response.status_code == 200:
        return response.content
    else:
        log('ERROR', 'Error while retrieving page',
            {'statusCode': response.status_code})
        return {'error': 'Invalid Status Code', 'status_code': response.status_code}

def obtener_codigo_html(url):
    try:
        # Realizar una solicitud HTTP GET a la URL proporcionada
        response = urllib.request.urlopen(url)

        # Leer el contenido HTML de la página
        codigo_html = response.read().decode('utf-8')

        # Devolver el contenido HTML de la página
        return codigo_html
    except urllib.error.URLError as e:
        # Si ocurre un error durante la solicitud, mostrar el mensaje de error
        print(f"Error durante la solicitud HTTP: {e}")
        return None

def get_num_max_page():
    response = GET(LINK)
    if response.status_code == 200:
        contenido = response.content
    
        soup = BeautifulSoup(contenido, "html.parser")

        # Extraer la cadena de paginas
        pages = soup.find("span", class_="KxHAYs _2kjxJ6 FxZV-M HlZ_Tf JCuRr_ _0xLoFW uEg2FS FCIprz")

        cad_pages = pages.text.strip()

        last_page = cad_pages.split("de")

        page = int(last_page[1])

        return page

def print_hello():
    #Enviar mensaje separador
    send_last_line("----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------")

    global oldArticles
    articulos_data = []
    elementos_totales = 0
    country = 'IT'
    last_page = get_num_max_page()

    for i in range(1, last_page+1):
        url_page = LINK + '?p=' + str(i)
        data_page = obtener_codigo_html(url_page)

        #Obtener un json de productos
        articles = filter_json(data_page)

        #Concatenar los articulos
        articulos_data = articulos_data + articles

        elementos_totales = elementos_totales + len(articles)

    #Enviar mensaje separador
    send_last_line("----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------")

    print("-FINAL-")

if __name__ == "__main__":
    print_hello()

'''
dag = DAG('hello_world', description='Hola Mundo DAG',
schedule_interval='* * * * *',
start_date=datetime(2017, 3, 20),
catchup=False,)
hello_operator = PythonOperator(task_id='hello_task', python_callable=print_hello, dag=dag)'''