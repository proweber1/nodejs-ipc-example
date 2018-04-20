const {fork} = require('child_process');
const {promisify} = require('util');
const fs = require('fs');

promisify(fs.readdir)('./files')
    .then(makeThreadPromises)
    .then(processingResults => processingResults.reduce((l, r) => [...l, ...r]))
    .then(console.log)
    .catch(console.log);

/**
 * Эта функция возвращает промис который заверщается после всех промисов
 * который обрабатывают файлы
 *
 * Это по сути является синхронизацией потоков, чтобы результаты были
 * аггрегированны в один массив
 *
 * @param files
 * @returns {Promise<any[]>}
 */
function makeThreadPromises(files) {
    return Promise.all(files.map(f => makeProcessingThread(`./files/${f}`)));
}

/**
 * Создает один промис который является как бы потоком, для того
 * чтобы потом захватить результат с IPC канала
 *
 * @param fName
 * @returns {Promise<any>}
 */
function makeProcessingThread(fName) {
    if (!fName)
        throw new Error('file name must be set');

    return new Promise((resolve, reject) => {
        const p = fork('./thread.js', [fName]);
        let result = undefined;

        p.on('message', processingResult => result = processingResult);
        p.on('disconnect', () => {
            if (!result) {
                reject(new Error('thread return empty result'))
            } else {
                resolve(result);
            }
        });
    })
}
