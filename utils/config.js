require("dotenv").config();

const PORT = process.env.PORT || 3003;
const MONGO_URL = process.env.MONGODB_URI;

module.exports = { PORT, MONGO_URL };
