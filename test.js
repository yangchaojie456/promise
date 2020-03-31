
const _Promise = require('./index')

/*
    测试
 */
var pro = new _Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('resolve')
        // reject('reject')
    }, 500);
})

pro.then(res => {
    console.log(res, 'then1')
    // console.s.c
    // return 'resolve2'
    return new _Promise((resolve, reject) => {
        // reject(5555)
        resolve('resolve3')
    })
}, err => {
    console.log(err, 'error1')
}).then(res => {
    console.log(res, 'then2')
}).catch(err => {
    console.log(err, 'error2')
})

pro.then(res => {
    console.log(res, 'then3')
})

function promiseAsync() {
    return new _Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('await')
        }, 2000)
    })
}

(async function () {
    try {
        var res = await promiseAsync()
        console.log(res)
    } catch (error) {

    }
})()