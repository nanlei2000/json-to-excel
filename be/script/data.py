# -*- coding: utf-8 -*-
########## prepare ##########
# install mysql-connector-python:
# pip3 install mysql-connector-python --allow-external mysql-connector-python
import json
import mysql.connector

# change root password to yours:
conn = mysql.connector.connect(
    user='nanlei', password='@1Nt9152572515', database='fun_api')

with open('./idiom.json') as f:
    rows = json.load(f)
    for row in rows:
        cursor = conn.cursor()
        cursor.execute(''' 
            INSERT INTO idiom SET
            derivation=%s,
            example=%s,
            explanation=%s,
            pinyin=%s,
            word=%s,
            abbr=%s
''', (row['derivation'],
            row['example'],
            row['explanation'],
            row['pinyin'],
            row['word'],
            row['abbreviation']))
        conn.commit()
        cursor.close()

conn.close()
