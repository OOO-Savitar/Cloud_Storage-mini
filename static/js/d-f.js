$(document).ready(function () {
    // const dropFileZone = document.querySelector(".upload-zone_dragover")
    // const statusText = document.getElementById("uploadForm_Status")

    // let setStatus = (text) => {
    //     statusText.textContent = text
    // }

    // ["dragover", "drop"].forEach(function (event) {
    //     document.addEventListener(event, function (evt) {
    //         evt.preventDefault();
    //         return false
    //     })
    // });

    // dropFileZone.addEventListener("dragenter", function () {
    //     dropFileZone.classList.add("_active");
    // });


    // $(document).on('dragenter', function () {
    //     $('.drag-drop-files').toggleClass('d-none');
    // });

    // $(document).on('dragleave', function () {
    //     $('.drag-drop-files').toggleClass('d-none');
    // });

    // $(document).on('drop', function () {
    //     $('.drag-drop-files').toggleClass('d-none');
    //     $('.dialog').removeClass('d-none');
    //     $('#hide-load-menu').text('Свернуть');
    //     $('.dialog').removeClass('collapsed-dialog');
    // });

    // $('#hide-load-menu').on('click', function () {
    //     const dialog = $('.dialog')
    //     dialog.toggleClass('collapsed-dialog');
    //     $(this).text(dialog.hasClass('collapsed-dialog') ? "Развернуть" : "Свернуть");
    // });

    // $('#close-load-menu').on('click', function () {
    //     const dialog = $('.dialog')
    //     dialog.addClass('d-none');
    //     dialog.removeClass('collapsed-dialog');
    //     $('.line_3').empty();
    // });

    // dropFileZone.addEventListener("dragleave", function () {
    //     dropFileZone.classList.remove("_active")
    // });


    dropFileZone.addEventListener("drop", async function (event) {
        dropFileZone.classList.remove("_active");
        const files = Array.from(event.dataTransfer?.files);
        let files_in_cloud = []

        if (!files || files.length === 0) {
            return;
        }

        files.forEach((file, index) => {
            const line = render_file_line_template(file);
            $('.line_3').append(line);
        });

        const file_index = $('.line_file_template', $('.line_3')).length
        files.forEach((file, index) => {

            let data = check_existing_file(file, files.length);
            console.log(data);
            // if (data) {
            //     $('#progress_file_' + (file_index - files.length + index)).css({
            //         'width': '100%',
            //     });
            // }
        });
    });

    function render_file_line_template(file) {
        var line_template = $('#line_file_template').clone();
        line_template.removeAttr('id');
        line_template.addClass('line_file_template');
        var img = $('.img', line_template);
        var file_icon_name = getFileIcon(file);

        fetch('static/img/file_extensions_icons?filename=' + file_icon_name, {
            method: "GET",
        })
            .then(response => {
                if (!response.ok) throw new Error('Что-то пошло не так!')
                return response.json();
            })
            .then(data => {
                img.css({
                    'background': `url(${data['image']}) no-repeat center top/cover`,
                });
            })
            .catch(error => {
                console.log('ERROR:: ', error);
            })
        img.css({
            'width': '40px',
            'height': '40px',
            'margin': 'auto',
        })
        $('.subline-name', line_template).text(file.name)
        $('.subline-weight', line_template).text(formatBytes(file.size))

        line_template.removeClass('d-none');

        const file_index = $('.line_file_template', $('.line_3')).length;
        $('.progress-bar', line_template).attr('id', `progress_file_${file_index}`);
        $('button', line_template).addClass(`button_share_file_${file_index}`);

        return line_template;
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) {
            return '0';
        } else {
            var k = 1024;
            var dm = decimals < 0 ? 0 : decimals;
            var sizes = ['байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }
    }

    function getFileIcon(file) {
        var file_extension = file.name.split('.').pop();
        return `${file_extension}.png`;
    }

    function check_file(file) {
        let files_in_cloud = []
        fetch(`/check/file/exists?filename=${file.name}`, {
            method: 'GET',
        })
            .then(response => {
                if (!response.ok) throw new Error;
                return response.json();
            })
            .then(data => {
                if (data['exist']) files_in_cloud.push(file);
            })
            .catch(error => {
                console.log('ERROR:: ', error);
            })

        return files_in_cloud;
    }

    async function check_existing_file(file, length) {
        fetch(`/check/file/exists?filename=${file.name}`, {
            method: 'GET',
        })
            .then(response => {
                if (!response.ok) return;
                return response.json();
            })
            .then(cheched_file => {
                if (cheched_file['exist']) {
                    console.log('Файл в облаке');
                    const line_file_exists = $('#line_file_exists');
                    line_file_exists.removeClass('d-none');
                    $('.img_file_exists', line_file_exists).addClass(`file-icon_${cheched_file['extension']}`)
                    throw new Error('in_cloud')
                }
                else {
                    console.log('Файл не в облаке');
                    return uploadFile(file, length);
                }
            })
            .catch(error => {
                if (error.message != 'in_cloud') {
                    console.log(error)
                    return;
                };
                console.log('fdf');
                return file;
            })
    }

    async function uploadFile(file, total_files) {
        if (!file) throw Error('No file selected');

        var formData = new FormData();
        formData.append('file', file);

        var conroller = new AbortController();
        var signal = conroller.signal;

        await fetch('/upload', {
            method: 'POST',
            body: formData,
            signal: signal,
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('File upload failed!');
                }
                return response.json();
            })
            .then(data => {
                // console.log('File uploaded successfully: ', data);
                let total_progress_bar = $('.total_progress', $('.dialog'));
                if (data['success']) {
                    total_progress_bar.css({
                        'width': `${Math.ceil(parseFloat(total_progress_bar.css('width')) + (500 / total_files))}%`
                    });
                    insertUploadedFile(data);
                }
            })
            .catch(error => {
                console.error('Error uploading file: ', error);
            });
    }

    function insertUploadedFile(data) {
        console.log(data);
        let r = $('.file_block_template .listing-item').clone();
        $('.clamped-text', r).text(data['file_name'])
        $('.file-icon', r).addClass('file-icon_' + data['extension'])
        $('.listing__items').prepend(r);
    }


    // function processingDownloadFileWithFetch() {
    //     fetch(url, {
    //         method: "POST",
    //     }).then(async (res) => {
    //         const reader = res?.body?.getReader();
    //         while (true && reader) {
    //             const { value, done } = await reader?.read()
    //             console.log("value", value)
    //             if (done) break
    //             console.log("Received", value)
    //         }
    //     })
    // }
});