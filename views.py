from flask import render_template, request, jsonify
from funcs import *
import json

with open('config.json', 'r', encoding='utf-8') as file:
    config_data = json.load(file)

themes_id = {item['name']: item['id'] for item in config_data['backgrounds']}


@app.route('/')
def main():
    return render_template('index.html', backgrounds=config_data['backgrounds'])


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


@app.route('/set_background', methods=['GET'])
def return_background():
    background_name = request.args.get('name', None)

    base_json_request = {
        'name': background_name,
    }

    if not background_name:
        base_json_request['success'] = False
        return jsonify(base_json_request)

    for item in config_data['backgrounds']:
        if item.get('name') == background_name:
            if item.get('additional', {}).get('is_color'):
                base_json_request['is_color'] = True
                base_json_request['color'] = item.get('preview')
                return jsonify(base_json_request), 200
            else:
                base_json_request['preview'] = item.get('preview')
                base_json_request['background'] = item.get('background')
                return jsonify(base_json_request), 200


@app.route('/get-background-section', methods=['GET'])
def get_background_section():
    theme = request.args.get('theme', 'base')
    play_video = request.args.get('play', False) == 'true'
    item = config_data['backgrounds'][themes_id[theme]]
    return jsonify(render_template('background__main_template.html', play=play_video, theme=item))


app.run(host='0.0.0.0', debug=True)
