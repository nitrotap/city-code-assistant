/*eslint no-undef: "error"*/
/*eslint-env node*/

const express = require('express');
require('dotenv').config();
const fs = require('fs');
const https = require('https');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');

const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connection');

const PORT = process.env.PORT || 443; // Default HTTPS port
const app = express();

// SSL certificate options
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/citycodeassistant.com/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/citycodeassistant.com/cert.pem'),
    ca: fs.readFileSync('/etc/letsencrypt/live/citycodeassistant.com/chain.pem')
};

const startServer = async () => {
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: authMiddleware,
    });
    await server.start();
    server.applyMiddleware({ app });
    console.log(`Use GraphQL at https://localhost:${PORT}${server.graphqlPath}`);
};

startServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve up static assets
app.use('/images', express.static(path.join(__dirname, '../client/images')));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

db.once('open', () => {
    https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
        console.log(`API server running on port ${PORT}!`);
    });
});

// Optionally, redirect HTTP traffic to HTTPS
const http = require('http');
http.createServer((req, res) => {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(80, '0.0.0.0');
