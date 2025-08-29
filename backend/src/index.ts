import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (_req, res) => {
    res.send("ThaiTable API is running 🚀");
});

app.listen(PORT, () => {
    console.log(`ThaiTable backend listening on port ${PORT}`);
});
