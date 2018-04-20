const fs = require('fs');
const {promisify} = require('util');

const ACCOUNT_SEGMENT = 1;
const USER_NAME_SEGMENT = 0;

const myFileName = process.argv[2];

/*
 * Этот код в виде цепочки промисов делает обработку файла, ищет
 * в нем людей у которых сумма счета >= 10_000 долларов
 */
promisify(fs.readFile)(myFileName).then(buffer => buffer.toString())
    .then(fileAsString => fileAsString.split('\n'))
    .then(processUsers)
    .then(sendResultToParent)
    .then(() => process.disconnect());

/**
 * Эта функция возвращает список пользователей у которых размер
 * счета больше или равен $10 000
 *
 * @param userLines
 * @returns {Array}
 */
function processUsers(userLines) {
    const res = [];
    for (const line of userLines) {
        const segments = line.split(' ');
        if (parseInt(segments[ACCOUNT_SEGMENT], 10) >= 10000)
            res.push(segments[USER_NAME_SEGMENT])
    }
    return res;
}

/**
 * Эта функция отсылает результат по IPC каналу родительскому процессу
 *
 * @param users
 * @returns {Promise<void>}
 */
function sendResultToParent(users) {
    process.send(users);

    return Promise.resolve();
}
