
const mongoose = require('mongoose');

const state = {
    db: null,
};

module.exports.connect = function (done) {
    const url = 'mongodb://localhost:27017';
    const dbName = 'Shopping';

    mongoose.connect(`${url}/${dbName}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = mongoose.connection;

    db.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        done(err);
    });

    db.once('open', () => {
        state.db = db;
        console.log('MongoDB connection established');
        done();
    });
};

module.exports.get = function () {
    return state.db;
};