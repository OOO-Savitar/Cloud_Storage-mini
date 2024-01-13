var send_files_in_cloud__let = [];
var send_files_in_cloud__let_index_dialog = [];

var myArray = [];
var eventHandlers = [];
let step_progress = 0;


$(document).ready(async function () {
    const dropFileZone = document.querySelector(".upload-zone_dragover");
    await render_page_file_items();


    ["dragover", "drop"].forEach(function (event) {
        document.addEventListener(event, function (evt) {
            evt.preventDefault();
            return false
        })
    });

    $('#confirmOvervrite').on('click', async function () {
        const index = $(this).attr('fileindex');
        let upload_response = await uploadFile(send_files_in_cloud__let[index]);
        hideExistFileLine();
        if (upload_response.success) {
            upload_response.filename = shortenFileName(upload_response.file);
            send_files_in_cloud__let.splice(index, 1);
            render_file_line_template(upload_response);
            $('.total_progress').css('width', $('.total_progress').width() + step_progress);
            showExistFileLine(index);
        }
    });

    $('#cancelOvervrite').on('click', function () {
        const index = $(this).attr('fileindex');
        hideExistFileLine();
        console.log(send_files_in_cloud__let, send_files_in_cloud__let_index_dialog);
        console.log('_______________');
        if (index >= 0 && index < $('.dynamic_line', '.line_3').length) {
            const element = $('.dynamic_line', $('.line_3')).eq(send_files_in_cloud__let_index_dialog[index]);
            console.log($('.subline-name', element).attr('filename'));
            console.log(send_files_in_cloud__let[index].name);
            if ($('.subline-name', element).attr('filename') == send_files_in_cloud__let[index].name) element.remove();
        }

        send_files_in_cloud__let.splice(index, 1);
        send_files_in_cloud__let_index_dialog.splice(index, 1);
        $('.total_progress').css('width', $('.total_progress').width() + step_progress);
        showExistFileLine(index);
        if (send_files_in_cloud__let.length == 0 && $('.line_3 .dynamic_line').length == 0) close_dialog()
    });

    $(document).on('dragenter', function () {
        $('.drag-drop-files').removeClass('d-none');
        dropFileZone.classList.add("_active");
    });

    $(document).on('drop', function (event) {
        $('.drag-drop-files').addClass('d-none');
        $('.dialog').removeClass('d-none');
        $('#hide-load-menu').text('Свернуть');
        $('.dialog').removeClass('collapsed-dialog');
    });

    dropFileZone.addEventListener('dragleave', function () {
        $('.drag-drop-files').addClass('d-none');
        dropFileZone.classList.remove("_active");
    });

    dropFileZone.addEventListener("drop", async function (event) {
        hideExistFileLine();
        const files = Array.from(event.dataTransfer?.files || []);
        const totalFiles = files.length;
        let currentProgress = 0;
        dropFileZone.classList.remove("_active");
        send_files_in_cloud__let = [];
        send_files_in_cloud__let_index_dialog = [];
        let progress_step = $('.dialog').width() / totalFiles;

        $('.total_progress').css('--bs-progress-bar-transition', 'width 0s');
        $('.total_progress').css('width', 0);
        setTimeout(function () {
            $('.total_progress').css('--bs-progress-bar-transition', 'width .6s ease');
        }, 100);

        for (const [index, file] of files.entries()) {
            try {
                let current_index = $('.line_file_template', $('.line_3')).length;
                let response = await checkFileExistenceAsync(file);

                response.filename = shortenFileName(file.name);
                const fileInLInDialog = checkFileExistInLineDialog(file);
                if (fileInLInDialog == undefined) {
                    await render_file_line_template(response);
                } else {
                    changeExistFileLineDialogState(fileInLInDialog, true);
                }

                if (response.exist) {
                    send_files_in_cloud__let.push(file);
                    send_files_in_cloud__let_index_dialog.push(current_index);
                    changeExistFileLineDialogState(current_index, true);
                } else {
                    let upload_response = await uploadFile(file);
                    // let upload_response = { 'success': true };
                    if (!upload_response.success) { throw new Error };
                    upload_response.filename = shortenFileName(upload_response.file)
                    await insertUploadedFile(upload_response);
                    let fi = $(`#progress_file_${current_index}`);
                    fi.css('width', '100%');
                }
            } catch (error) {
                console.log(`ERROR_UFE:: ${file.name} ::`, error);
            }
        }

        if (send_files_in_cloud__let) {
            step_progress = $('.dialog').width() / send_files_in_cloud__let.length;
            await showExistFileLine(0);
        }
    });

    function changeExistFileLineDialogState(fileIndex, fileExist = false) {
        let lines = $('.dynamic_line', $('.line_3'));
        if (lines.length == 0) return undefined;
        let line_FileButton = $(`.button_share_file_${fileIndex}`, lines);
        let line_FileExistSpan = $(`#exist_file_${fileIndex}`, lines);
        let line_FileProgress = $(`#progress_file_${fileIndex}`, lines);

        if (fileExist) {
            line_FileButton.addClass('d-none');
            line_FileProgress.closest('.progress').addClass('d-none');
            line_FileProgress.width(0);
            line_FileExistSpan.removeClass('d-none');
        } else {
            line_FileButton.addClass('d-none');
            line_FileProgress.removeClass('d-none')
            line_FileExistSpan.addClass('d-none');
        }
    }

    // try {
    //     let response = await checkFileExistenceAsync(file);
    //     response.filename = shortenFileName(file.name);
    //     await render_file_line_template(response);
    //     if (!response.ok) { console.log(`File ${file.name} uploading error!`); }
    //     if (response.exist) {
    //         send_files_in_cloud__let.push(file);
    //     } else {
    //         try {
    //             let upload_response = await uploadFile(file);
    //             if (!upload_response.success) throw new Error;
    //             upload_response.filename = shortenFileName(upload_response.file)
    //             await insertUploadedFile(upload_response);

    //             currentProgress += progress_step;
    //             $('.total_progress').css('width', currentProgress);
    //         } catch (error) {
    //             console.log('ERROR_UFSE::', error);
    //         }
    //     }
    // } catch (error) {
    //     console.log('ERROR_UFE::', error);
    //     continue;
    // }

    $('#hide-load-menu').on('click', function () {
        const dialog = $('.dialog')
        dialog.toggleClass('collapsed-dialog');
        $(this).text(dialog.hasClass('collapsed-dialog') ? "Развернуть" : "Свернуть");
    });

    $('#close-load-menu').on('click', function () {
        close_dialog();
    });

    async function showExistFileLine(index) {
        $('.line_3').animate({ scrollTop: 0 }, 'slow');
        if (!send_files_in_cloud__let || !send_files_in_cloud__let[index]) return;
        let line_file_exists = $('#line_file_exists');
        let r = await check_img_extension(send_files_in_cloud__let[index]);
        $('.file-icon', line_file_exists).addClass('file-icon_' + r.image);
        $('.name_file_exists', line_file_exists).text(send_files_in_cloud__let[index].name);
        $('#confirmOvervrite', line_file_exists).attr('fileindex', index);
        $('#cancelOvervrite', line_file_exists).attr('fileindex', index);
        line_file_exists.removeClass('d-none');
    }

    function checkFileExistInLineDialog(file) {
        let all_lines = $('[filename]', $('.dynamic_line', $('.line_3')));
        let fileExists = undefined;

        if (all_lines.length == 0) {
            return fileExists;
        }

        all_lines.each(function (index, element) {
            if (file.name === $(element).attr('filename')) {
                fileExists = index;
                return;
            }
        })
        return fileExists;
    }

    function close_dialog() {
        const dialog = $('.dialog');
        dialog.addClass('d-none');
        dialog.removeClass('collapsed-dialog');
        $('.line_3 .dynamic_line').remove();
        $('#line_file_exists').addClass('d-none');
    }

    function hideExistFileLine() {
        let line_file_exists = $('#line_file_exists');
        line_file_exists.addClass('d-none');
        $('.name_file_exists', line_file_exists).text('');
        $('#confirmOvervrite', line_file_exists).attr('fileindex', -1);
        $('#cancelOvervrite', line_file_exists).attr('fileindex', -1);
    }

    function checkFileExistenceAsync(file) {
        return $.ajax({
            url: '/check/file/exists?filename=' + file.name + '&file_size=' + file.size,
            method: 'GET',
        });
    }

    async function render_page_file_items() {
        let files = await getAllFiles();
        for (let index in files) {
            files[index].filename = shortenFileName(files[index].file);
            insertUploadedFile(files[index]);
        }
    }

    async function getAllFiles(folder_name = 'files') {
        try {
            const response = await fetch('/get/all/files?folder_name=' + folder_name, {
                method: 'GET',
            });

            if (!response.ok) {
                throw new Error('File upload failed!');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.log('ERROR_GAFE::', error);
        }
    }

    // async function uploadFile(file) {
    //     if (!file) throw Error('No file selected');

    //     var formData = new FormData();
    //     formData.append('file', file);

    //     var conroller = new AbortController();
    //     var signal = conroller.signal;

    //     try {
    //         const response = await fetch('/upload', {
    //             method: 'POST',
    //             body: formData,
    //             signal: signal,
    //         })

    //         if (!response.ok) {
    //             throw new Error('File upload failed!');
    //         }
    //         const data = await response.json();
    //         return data

    //     } catch (error) {
    //         console.error('Error uploading file: ', error);
    //     }
    // }

    async function uploadFile(file) {
        if (!file) throw Error('No file selected');

        try {
            var formData = new FormData();
            formData.append('file', file);

            let response = await axios.post('/upload', formData, {
                onUploadProgress: function (progressEvent) {
                    const { loaded, total } = progressEvent;
                    let precentage = Math.floor((loaded * 100) / total);
                    // console.log(precentage);
                }
            });

            if (!response.data || response.status != 200) {
                throw new Error('File upload failed!');
            }

            return response.data;
        } catch (error) {
            console.error('Error uploading file: ', error);
        }
    }

    async function check_img_extension(file) {
        try {
            const response = await fetch('/static/img/file_extensions_icons?filename=' + file.name, {
                method: 'GET'
            })

            if (!response.ok) throw new Error
            const data = await response.json();
            return data
        } catch (error) {
            console.log('ERROR_CIEE::', error);
        }
    }

    async function render_file_line_template(response) {
        var line_template = $('#line_file_template').clone();
        line_template.removeAttr('id');
        line_template.addClass('line_file_template');
        $('.file-icon', line_template).addClass('file-icon_' + response.img);
        $('.subline-name', line_template).attr('filename', response.file).text(response.filename);
        $('.subline-weight', line_template).text(formatBytes(response.size))

        line_template.removeClass('d-none');

        const file_index = $('.line_file_template', $('.line_3')).length;
        $('.progress-bar', line_template).attr('id', `progress_file_${file_index}`).width(0);
        $('.exist_file', line_template).attr('id', `exist_file_${file_index}`)
        $('button', line_template).addClass(`button_share_file_${file_index}`);

        $('.line_3').append(line_template);
    }

    async function insertUploadedFile(data) {
        let r = $('.file_block_template .listing-item').clone();
        $('.clamped-text', r).text(data.filename)
        $('.file-icon', r).addClass('file-icon_' + data.img)
        $('.listing__items').prepend(r);
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

    function shortenFileName(fullFileName) {
        const maxNameLength = 18;

        if (fullFileName.length <= maxNameLength) {
            return fullFileName;
        }

        const extension = fullFileName.split('.').pop();
        const truncatedName = fullFileName.slice(0, maxNameLength - 2);
        const subTemp = fullFileName.split('.')[fullFileName.split('.').length - 2]
        const shortenedName = truncatedName + '...' + subTemp.slice(-2) + '.' + extension;

        return shortenedName;
    }
});