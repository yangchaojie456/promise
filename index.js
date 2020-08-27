// 三种状态 pending fulfilled rejected

function _Promise(fn) {
    this.promiseStatus = 'pending'
    this.promiseValue = ''
    this.promiseReason = ''

    this.waitFulfilled = []
    this.waitRejected = []
    this.waitFinally = []

    try {
        fn && fn(resolve.bind(this), reject.bind(this))
    } catch (error) {
        return new _Promise(function (resolve, reject) {
            reject(error)
        })
    }

}

function resolve(value) {
    if (this.promiseStatus !== 'pending') {
        return
    } else {
        this.promiseValue = value
        this.promiseStatus = 'fulfilled'
        // 触发等待队列
        for (var i = 0; i < this.waitFulfilled.length; i++) {
            var {
                resolve,
                reject,
                onFulfilled
            } = this.waitFulfilled[i]
            var result = null
            try {
                result = onFulfilled(this.promiseValue)
            } catch (error) {
                reject(error)
                return
            }
            if (typeof result === 'object' && typeof result.then == 'function') {
                result.then(resolve, reject)
            } else {
                resolve(result)
            }
        }

        for (var i = 0; i < this.waitFinally.length; i++) {
            var {
                resolve,
                reject,
                fn
            } = this.waitFinally[i]
            var result = null
            try {
                result = fn()
            } catch (error) {
                reject(error)
                return
            }
            if (typeof result === 'object' && typeof result.then == 'function') {
                result.then(resolve, reject)
            } else {
                resolve(result)
            }
        }
    }
}

function reject(reason) {
    if (this.promiseStatus !== 'pending') {
        return
    } else {
        this.promiseReason = reason
        this.promiseStatus = 'rejected'

        // 触发等待队列
        for (var i = 0; i < this.waitRejected.length; i++) {
            var {
                resolve,
                reject,
                onRejected
            } = this.waitRejected[i]
            var result = null
            try {
                result = onRejected(this.promiseReason)
            } catch (error) {
                reject(error)
                return
            }
            if (typeof result === 'object' && typeof result.then == 'function') {
                result.then(resolve, reject)
            } else {
                resolve(result)
            }
        }

        for (var i = 0; i < this.waitFinally.length; i++) {
            var {
                resolve,
                reject,
                fn
            } = this.waitFinally[i]
            var result = null
            try {
                result = fn()
            } catch (error) {
                reject(error)
                return
            }
            if (typeof result === 'object' && typeof result.then == 'function') {
                result.then(resolve, reject)
            } else {
                resolve(result)
            }
        }
    }
}

_Promise.prototype.finally = function (fn) {


    var promise = null
    var result = null
    var error = null
    switch (this.promiseStatus) {
        case 'fulfilled':
            try {
                result = fn()
            } catch (err) {
                error = err
            }
            if (error) {
                promise = new _Promise((resolve, reject) => {
                    reject(error)
                })
            } else {
                if (typeof result === 'object' && typeof result.then == 'function') {
                    promise = result
                } else {
                    promise = new _Promise(resolve => {
                        resolve(result)
                    })
                }
            }
            break;
        case 'rejected':
            try {
                result = fn()
            } catch (err) {
                error = err
            }
            if (error) {
                promise = new _Promise((resolve, reject) => {
                    reject(error)
                })
            } else {
                if (typeof result === 'object' && typeof result.then == 'function') {
                    promise = result
                } else {
                    promise = new _Promise(resolve => {
                        resolve(result)
                    })
                }
            }
            break;
        case 'pending':
            // 加入队列等待

            promise = new _Promise((resolve, reject) => {
                typeof fn == 'function' && this.waitFinally.push({
                    resolve,
                    reject,
                    fn
                })
            })
            break;
        default:
            promise = {}
            break;
    }
    return promise
}
_Promise.prototype.then = function (onFulfilled, onRejected) {


    var promise = null
    var result = null
    var error = null
    switch (this.promiseStatus) {
        case 'fulfilled':
            if (typeof onFulfilled !== 'function') {
                // 原封不动交给下个then 处理（如果有）
                return this
            }
            try {
                result = onFulfilled(this.promiseValue)
            } catch (err) {
                error = err
            }
            if (error) {
                promise = new _Promise((resolve, reject) => {
                    reject(error)
                })
            } else {
                if (typeof result === 'object' && typeof result.then == 'function') {
                    promise = result
                } else {
                    promise = new _Promise(resolve => {
                        resolve(result)
                    })
                }
            }
            break;
        case 'rejected':
            if (typeof onRejected !== 'function') {
                return this
            }
            try {
                result = onRejected(this.promiseReason)
            } catch (err) {
                error = err
            }
            if (error) {
                promise = new _Promise((resolve, reject) => {
                    reject(error)
                })
            } else {
                if (typeof result === 'object' && typeof result.then == 'function') {
                    promise = result
                } else {
                    promise = new _Promise(resolve => {
                        resolve(result)
                    })
                }
            }
            break;
        case 'pending':
            // 加入队列等待

            promise = new _Promise((resolve, reject) => {
                typeof onFulfilled == 'function' && this.waitFulfilled.push({
                    resolve,
                    reject,
                    onFulfilled
                })
                typeof onRejected == 'function' && this.waitRejected.push({
                    resolve,
                    reject,
                    onRejected
                })
            })
            break;
        default:
            promise = {}
            break;
    }
    return promise
}
_Promise.prototype.catch = function (onRejected) {
    var promise = null
    var result = null
    var error = null
    switch (this.promiseStatus) {
        case 'fulfilled':
            return this
            break;
        case 'rejected':
            if (onRejected && typeof onRejected !== 'function') {
                return this
            }
            try {
                result = onRejected(this.promiseReason)
            } catch (err) {
                error = err
            }
            if (error) {
                promise = new _Promise((resolve, reject) => {
                    reject(error)
                })
            } else {
                if (typeof result === 'object' && typeof result.then == 'function') {
                    promise = result
                } else {
                    promise = new _Promise(resolve => {
                        resolve(result)
                    })
                }
            }
            break;
        case 'pending':
            // 加入队列等待
            promise = new _Promise((resolve, reject) => {
                this.waitRejected.push({
                    resolve,
                    reject,
                    onRejected
                })
            })
            break;
        default:
            promise = {}
            break;
    }
    return promise
}
_Promise.resolve = function (value) {
    if (value instanceof _Promise || typeof value == 'object' && typeof value.then === 'function') {
        return value
    } else {
        return new _Promise(resolve => {
            resolve(value)
        })
    }
}

_Promise.reject = function (value) {
    if (value instanceof _Promise) {
        return value
    } else if (typeof value == 'object' && typeof value.then === 'function') {
        return new _Promise((resolve, reject) => {
            reject(value)
        })
    } else {
        return new _Promise((resolve, reject) => {
            reject(value)
        })
    }
}
_Promise.all = function (arr) {

}
_Promise.race = function (arr) {

}