# -*- coding: utf-8 -*-
########## prepare ##########
# install mysql-connector-python:
# pip3 install mysql-connector-python --allow-external mysql-connector-python
import json
import mysql.connector


def get_next_id_str(words, word):
    tail_str = word[-1]
    res = []
    for word in words:
        if word[0][0] == tail_str:
            res.append(str(word[1]))
    return ','.join(res)


# change root password to yours:
conn = mysql.connector.connect(
    user='nanlei', password='@1Nt9152572515', database='fun_api')
cursor = conn.cursor()
cursor.execute('SELECT word,id FROM idiom')
res = cursor.fetchall()
print(res[0])
for item in res:
    cursor.execute(''' 
            UPDATE idiom SET
            next_id_str=%s
            WHERE id=%s
''', (get_next_id_str(res, item[0]), item[1]))
    conn.commit()

cursor.close()
conn.close()
