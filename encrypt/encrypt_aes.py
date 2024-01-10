from Crypto.Cipher import AES
from Crypto.Random import get_random_bytes
import base64

from bson import ObjectId

key = get_random_bytes(16)
iv = get_random_bytes(16)

with open('./img/pdf.png', 'rb') as image_file:
    image_data = image_file.read()

cipher = AES.new(key, AES.MODE_CBC, iv)
image_data += b"\0" * (16 - len(image_data) % 16)

encrypt_data = cipher.encrypt(image_data)

encrypt_base64_img = base64.b64encode(encrypt_data).decode('utf-8')
