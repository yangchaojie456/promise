/**
 * promise/A+ 规范 中文
 * https://sobird.me/promise-a-plus-standard.htm
 * @param {*} cb 
 */
function _Promise(cb) {
    // promise/A+规范 2.1
    // 一个promise必须处于三种状态之一： 等待态（pending）， 完成态（fulfilled），拒绝态（rejected）
    // promise/A+规范 2.1.1
    this.promiseStatus = 'pending'
    this.promiseValue = undefined // 值
    this.promiseError = undefined // 拒因

    this.resolveList = []
    this.rejectList = []

    function resolve(value) {
        // promise/A+规范 2.1.2
        // 改过状态不能再改
        if (this.promiseStatus != 'pending') {
            return
        }
        this.promiseStatus = 'fulfilled'
        this.promiseValue = value
        for (var i = 0, l = this.resolveList.length; i < l; i++) {
            this.resolveList[i](value)
        }

    }
    function reject(error) {
        // promise/A+规范 2.1.3
        // 改过状态不能再改
        if (this.promiseStatus != 'pending') {
            return
        }
        this.promiseStatus = 'rejected'
        this.promiseError = error
        for (var i = 0, l = this.rejectList.length; i < l; i++) {
            this.rejectList[i](error)
            break
        }
    }

    cb(resolve.bind(this), reject.bind(this))
}

_Promise.prototype = {
    // promise/A+规范 2.2
    /*
        promise必须提供一个then方法来获取它当前或最终的值或者原因。
        promise的then方法接收两个参数：
    */
    then(onFulfilled, onRejected) {
        if (this.promiseStatus == 'fulfilled') {
            if (typeof onFulfilled == 'function') {
                var _this = this

                var promise = new _Promise((resolve, reject) => {
                    try {
                        var x = onFulfilled(_this.promiseValue)
                        // 2.3.1 如果promise和x引用同一个对象，则用TypeError作为原因拒绝（reject）promise。
                        if (x == promise) {
                            throw 'TypeError'
                        }

                        /*
                                                Promise解决程序是一个抽象的操作，其需输入一个 promise 和一个值，
                                                我们表示为 [[Resolve]](promise, x)，
                                                如果 x 有 then 方法且看上去像一个 Promise ，
                                                解决程序即尝试使 promise 接受 x 的状态；
                                                否则其用x的值来成功执行 promise 。
                                            */
                        // 2.3.2 如果x是一个promise,采用promise的状态
                        if (x instanceof _Promise) {
                            x.then(resolve, reject)
                        }
                        // else if (typeof x == 'object' || typeof x == "function") {
                        //     // 2.3.3 如果x是个对象或者方法
                        //     // ...
                        // }
                        else {
                            // 2.3.4 如果 x既不是对象也不是函数，用x完成(fulfill)promise
                            resolve(x)
                        }
                    } catch (err) {
                        reject(err)
                    }
                })
                return promise
            } else {
                return new _Promise(resolve => resolve(this.promiseValue))
            }
        }
        if (this.promiseStatus == 'rejected') {
            if (typeof onRejected == 'function') {
                var _this = this


                var promise = new _Promise((resolve, reject) => {
                    // 2.2.6 then方法可以在同一个promise里被多次调用  
                    // resolveList 存储多次 then 注册的回调函数

                    try {
                        onRejected(this.promiseError)
                    } catch (err) {
                        reject(err)
                    }
                })
                return promise
            } else {
                return new Promise((resolve, reject) => { reject(this.promiseError) })
            }
        }
        // 2.2.1 onFulfilled和onRejected都是可选的参数：不是函数，必须忽略
        // 2.2.2 如果onFulfilled是函数:
        /*
                2.2.2.1 此函数必须在promise完成(fulfilled)后被调用,并把promise的值作为它的第一个参数。
                2.2.2.2 此函数在promise完成(fulfilled)之前不可被调用。
                2.2.2.3 此函数不可被调用超过一次。
            */
        // 2.2.3 如果onRejected是函数:
        /*
                 2.2.3.1 此函数必须在promise拒绝(rejected)后被调用,并把promise 的reason作为它的第一个参数。
                 2.2.3.2 此函数在promise拒绝(rejected)之前不可被调用。
                 2.2.3.2 此函数不可被调用超过一次。
            */
        if (this.promiseStatus == 'pending') {

            var _this = this


            var promise = new _Promise((resolve, reject) => {
                // 2.2.6 then方法可以在同一个promise里被多次调用  
                // resolveList 存储多次 then 注册的回调函数
                typeof onFulfilled == "function" && _this.resolveList.push((value) => {
                    try {
                        var x = onFulfilled(value)
                        // 2.3.1 如果promise和x引用同一个对象，则用TypeError作为原因拒绝（reject）promise。
                        if (x == promise) {
                            throw 'TypeError'
                        }

                        /*
                            Promise解决程序是一个抽象的操作，其需输入一个 promise 和一个值，
                            我们表示为 [[Resolve]](promise, x)，
                            如果 x 有 then 方法且看上去像一个 Promise ，
                            解决程序即尝试使 promise 接受 x 的状态；
                            否则其用x的值来成功执行 promise 。
                        */
                        // 2.3.2 如果x是一个promise,采用promise的状态
                        if (x instanceof _Promise) {
                            x.then(resolve, reject)
                        }
                        else if (typeof x == 'object' || typeof x == "function") {
                            /*
                            2.3.3 如果x是个对象或者方法
                            2.3.3.1把 x.then 赋值给 then
                            2.3.3.2如果取 x.then 的值时抛出错误 e ，则以 e 为原因拒绝 promise
                            2.3.3.3如果 then 是函数，将 x 作为函数的作用域 this 调用之。传递两个回调函数作为参数，第一个参数叫做 resolvePromise ，第二个参数叫做 rejectPromise:
                            2.3.3.3.1 如果/当 resolvePromise被一个值y调用，运行 [[Resolve]](promise, y)
                            2.3.3.3.2 如果/当 rejectPromise被一个原因r调用，用r拒绝（reject）promise
                            2.3.3.3.3 如果resolvePromise和 rejectPromise都被调用，或者对同一个参数进行多次调用，第一次调用执行，任何进一步的调用都被忽略
                            2.3.3.3.4 如果调用then抛出一个异常e,
                            2.3.3.3.4.1 如果resolvePromise或 rejectPromise已被调用，忽略。
                            2.3.3.3.4.2 或者， 用e作为reason拒绝（reject）promise
                            2.3.3.4 如果then不是一个函数，用x完成(fulfill)promise
                            */
                            function resolvePromise(y) {
                                y.then(resolve, reject)
                            }
                            function rejectPromise(r) {
                                reject(r)
                            }
                            try {
                                var then = x.then
                                if (typeof then == "function") {
                                    then.call(x, resolvePromise, rejectPromise)
                                } else {
                                    resolve(x)
                                }
                            } catch (error) {
                                reject(error)
                            }

                        }
                        else {
                            // 2.3.4 如果 x既不是对象也不是函数，用x完成(fulfill)promise
                            resolve(x)
                        }
                    } catch (err) {
                        reject(err)
                    }
                })
                typeof onRejected == "function" && _this.rejectList.push((error) => {
                    try {
                        onRejected(error)
                    } catch (err) {
                        reject(err)
                    }
                })
            })
            return promise
        }
    },
    catch(onRejected) {
        if (this.promiseStatus == 'rejected' && typeof onRejected == 'function') {
            onRejected(this.promiseError)
            return
        }
        this.rejectList.push((error) => {
            onRejected(error)
        })
    }
}

module.exports = _Promise