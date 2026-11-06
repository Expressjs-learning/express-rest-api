const colors = require("colors")
const dotenv = require("dotenv")
const mongoose = require("mongoose")

dotenv.config({path: "./config.env"})

const app = require("./src/app")

//Database connection
mongoose.set("strictQuery", false)
mongoose.connect(process.env.DATABASE_LOCAL).then(
    () => console.log(colors.cyan("Database is connected"))
)

//Server running
const PORT = process.env.PORT || 3000
const server = app.listen(PORT, () => {
    console.log(colors.cyan(`Server is running on port ${PORT} as ${process.env.NODE_ENV} mode`))
})