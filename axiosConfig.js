const axios = require('axios');
require('dotenv').config();
const instance = axios.create({
    headers: {'X-Riot-Token': process.env.RIOT_TOKEN}
});

module.exports = instance;