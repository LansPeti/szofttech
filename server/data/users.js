const fs = require("fs");

const data = fs.readFileSync('./data/users.json', 'utf8');
const users = JSON.parse(data).users;

module.exports = users;