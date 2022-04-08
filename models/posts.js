const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true, minlength: 10 },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
    image: { type: String, required: true }
   
})

module.exports = mongoose.model('Post', postSchema)