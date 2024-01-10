import os
from main import app


def file_exists(filename, folder_path=app.config['UPLOAD_FOLDER']):
    file_path = os.path.join(folder_path, filename)
    return os.path.exists(file_path)


def get_all_img_extensions(directory=app.config['FILE_EXTENSIONS']):
    exists_extensions = []

    for root, directories, files in os.walk(directory):
        for file in files:
            exists_extensions.append(file.split('.')[0])

    exists_extensions.pop(exists_extensions.index('no-file'))
    return exists_extensions


def formatting_correct_img(filename: str, extension: str = 'png', default_img='no-file'):
    # return app.config['FILE_EXTENSIONS'] + '/' + filename.split('.')[-1] + '.' + extension if filename.split('.')[
    #                                                         -1] in get_all_img_extensions() else default_img
    if not filename:
        return default_img
    extension_image = filename.split('.')[-1]
    return extension_image if extension_image and extension_image in get_all_img_extensions() else default_img


def get_files_per_path(directory='upload'):
    files = []

    for root, directories, files_ in os.walk(directory):
        for file in files_:
            files.append(file)
    return files

