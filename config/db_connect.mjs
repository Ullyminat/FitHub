import mongoose from "mongoose";

async function db_connect(url) {
    try {
        await mongoose.connect(url);
        console.log('Подключена БД');
    } catch (err) {
        console.log(err);
    }
}

export default db_connect;