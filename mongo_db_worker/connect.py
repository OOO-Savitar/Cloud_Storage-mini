import pymongo
from encrypt.encrypt_aes import encrypt_base64_img

db_client = pymongo.MongoClient('mongodb://localhost:27017/')

current_db = db_client["Pinti_Cloud_Storage"]

collection = current_db["users"]

users = []
for i in range(10):
    users.append({
        "user": i,
        "profile_img": encrypt_base64_img,
    })

insert_res = collection.insert_many(users)
print(insert_res.acknowledged)
