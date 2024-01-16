from flask import Flask

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = "upload"
app.config['FILE_EXTENSIONS'] = 'static/img/file_extensions_icons'

from views import *
