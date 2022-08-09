import app from "./app";

const PORT = process.env.PORT || 27017;

app.listen(PORT, () => {
    console.log(`raspberrypi-db-server is running on ${PORT}`)
})