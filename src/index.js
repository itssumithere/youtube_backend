import mongoose from 'mongoose';
import { DB_NAME } from './constaints.js';
import {app} from './app.js'
import dotenv from 'dotenv';

dotenv.config();


(async () => {
    try {
       await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
})().then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
.catch((err) =>{
    console.error(err);
})
