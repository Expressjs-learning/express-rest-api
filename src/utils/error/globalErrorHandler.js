const AppError = require("./appError")

// Development mode -> Send a dev error
const sendErrorForDev = (err, res) => {
    console.log("Dev error invoked")
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    })
}

// Development mode -> Send a dev error
const sendErrorForProd = (err, res) => {
    console.log("Prod error invoked")
    if(err.isOperational){
        //User is trusted
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        //User is unknown
        res.status(500).json({
            status: "error",
            message: "Something went wrong"
        })
        }
}

//DB related error handlers
//Handling invalid id errors (CastErrors)
const handleCastErrorDB = (err) => {
    const message = `Invalid ID: ${err.value}`

    return new AppError(message, 400)
}
//Handling duplicate fields
const handleDuplicateFieldDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0]

    const message = `Duplicate field value: ${value} Please enter another value!`

    return new AppError(message, 400)
}

//Handling validation errors
const handleValidationerrorDB = (err) => {
    const errors = Object.values(err.errors).map(item => item.message)

    const message = `Invalid input data ${errors.join(". ")}`
    
    return new AppError(message, 400)
}

module.exports = (err, req, res, next) => {
    err.status = err.status || "error"
    err.message = err.message || "Something went wrong"
    err.statusCode = err.statusCode || 500

    if(process.env.NODE_ENV === "development") {
        //Development error responses
        sendErrorForDev(err, res)
    } else {
        //Production error responses
        // Handling invalid database IDs
        if(err.name === "CastError"){
            err = handleCastErrorDB(err)
        }
        //Handling dupolicate fields
        if(err.code === 11000){
            err = handleDuplicateFieldDB(err)
        }
        //Handling validation errors
        if(err.name === "ValidationError"){
            err = handleValidationerrorDB(err)
        }
        sendErrorForProd(err, res)
    }
}