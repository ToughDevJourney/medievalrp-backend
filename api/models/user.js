const mongoose = require('mongoose');

const userSchema = {
    _id: mongoose.SchemaTypes.ObjectId,
    email: { type: String, required: true, unique: true, minlength: 7, maxlength: 50, match: /^\S+@\S+$/},
    password: {type: String, required: true}, //длина пароля ограничена проверкой в функции, которая принимает реквест, так как в базу пишется зашифрованное значение
    nickname: {type: String, required: true, unique: true, minlength: 4, maxlength: 30, match: /^[а-яА-Яa-zA-Z0-9-_]+$/},
    skin: {type: String, required: true, default: "poor-peasant"},
    role: {type: String, required: true, default: "peasant"},
    banned: {type: Boolean, required: true, default: false}
}

module.exports = mongoose.model('User', userSchema, "user-8")