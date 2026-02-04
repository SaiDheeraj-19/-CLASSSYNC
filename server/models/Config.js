const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        default: 'admin_secret'
    },
    value: {
        type: String,
        required: true,
        default: 'cyberadmin2024'
    }
});

module.exports = mongoose.model('Config', ConfigSchema);
