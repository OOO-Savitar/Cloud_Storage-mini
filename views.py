from flask import render_template, request, jsonify
from funcs import *


@app.route('/')
def main():
    return render_template('index.html', json_data=jsonify({'0': 1}).json)


@app.route('/check/file/exists')
def check():
    filename = request.args.get('filename', 'no-file.png')
    size = request.args.get('file_size', 0)

    if not filename:
        return jsonify({'error': 'No selected file'}), 400
    status = file_exists(filename)
    return jsonify({
        'userId': '10071971Pi',
        'file': filename,
        'img': formatting_correct_img(filename),
        'exist': status,
        'size': int(size),
        'extension': filename.split('.')[-1],
    }), 200


@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = file.filename
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        status = file_exists(filename)
        return jsonify({'userId': '10071971Pi',
                        'file': filename,
                        'extension': filename.split('.')[-1],
                        'img': formatting_correct_img(filename),
                        'size': os.path.getsize(f"{app.config['UPLOAD_FOLDER']}/{filename}"),
                        'success': status,
                        }), 200
    else:
        return jsonify({'error': 'File upload failed'}), 500


@app.route('/static/img/file_extensions_icons', methods=['GET'])
def get_image_from_file_type():
    filename = request.args.get('filename', 'no-file.png')
    return jsonify({'image': formatting_correct_img(filename),
                    'extension': filename.split('.')[-1]}), 200


@app.route('/get/all/files', methods=['GET'])
def get_all_files():
    files = get_files_per_path()
    images = [{'file': file, 'img': formatting_correct_img(file)} for file in files]

    return images


app.run(host='0.0.0.0', debug=True)
