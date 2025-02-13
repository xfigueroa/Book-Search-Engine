import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://xfigueroa:Nepuchun@cluster0.g5su0.mongodb.net/BookDB?retryWrites=true&w=majority&appName=Cluster0');


const db = mongoose.connection;

export default db;
