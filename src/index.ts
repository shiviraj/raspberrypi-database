import app from "./app";

const PORT = process.env.PORT || 27017;

app.listen(PORT, () => {
    console.log(`home-automation-database is running on ${PORT}`)
})