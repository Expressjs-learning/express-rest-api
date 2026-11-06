const express = require("express");
const ratelimit = require("express-rate-limit")
const helmet = require("helmet")
const mongoSanitize = require("@exortek/express-mongo-sanitize")
const {xss} = require("express-xss-sanitizer")

const AppError = require("./utils/error/appError")
const globalErrorHandler = require("./utils/error/globalErrorHandler")

//Routes
const postRouter = require("./routes/postRoutes")
const authRouter = require("./routes/authRoutes")

const app = express()

// 2) Setting HTTP security headers
app.use(helmet())

// 3) Body size limiting
app.use(express.json({limit: "50kb"}))

// 1) Rate limiting
const rateLimiter = ratelimit({
    max: 100, // Maximum requested for api calls per IP
    windowMs: 60*60*1000, // Within 1 hour
    message: "Too many requests, please try again later"
})

app.use("/api", rateLimiter)

// 4) Prevent NoSQL query injections
app.use(mongoSanitize())

// 5) Data sanitization against XSS attacks
app.use(xss())

app.use("/api/v1/post", postRouter)
app.use("/api/v1/auth", authRouter)

//Error handling : Handling unhandled routes
app.all("/{*any}", (req, res, next) => {
    const error = new AppError("Route is not defined", 404)

    next(error)
})

app.use(globalErrorHandler)

module.exports = app