const collections = require('../config/mongoCollections');
const userData = collections.Users
const mongodb = require("mongodb");
const bcrypt = require('bcrypt');
// const saltRounds = 16;
module.exports = {

    async addUsertoDB(signupObj) {
        const hashPassword = await bcrypt.hash(signupObj.password.toString(), 16);
        const hashStore = hashPassword.toString();
        const email = signupObj.email;
        const lowerEmail = email.toString().toLowerCase();
        const date = new Date();
        const month = date.getMonth()+1;
        const registered_date = month+"/"+date.getDate()+"/"+date.getFullYear();
        const userCollection = await userData();
        const newUser = {
                            first_name: signupObj.firstname,
                            last_name: signupObj.lastname,
                            email: lowerEmail,
                            hashed_pass: hashStore,
                            phone: null,
                            DOB: null,
                            gender: null,
                            profilePicture : null,
                            reg_date: registered_date  
                        }
            const newUserAdded = await userCollection.insertOne(newUser);
            if (newUserAdded.insertedCount === 0) 
                return false;
            return true;      
    },

    async userExistsCheck(email){
        const userCollection = await userData();
        //const lowerEmail = email.toString().toLowerCase();
        const userPresentInfo = await userCollection.findOne({ email_id: email });

        if (!userPresentInfo)
        {
           return false;
        }
        else 
        {
            return true;
        }   
    },

    async getUserByID(email){   
        const userCollection = await userData();
        const userPresentInfo = await userCollection.findOne({email:email});
        return userPresentInfo;
    },

    async loggingTheUser(email, password){   
       
        const userCollection = await userData();
        const userDataPresent = await userCollection.findOne({ email: email });
        console.log(userDataPresent.hashed_pass)
        if(userDataPresent.email===email)
        {
            let passCheck = await bcrypt.compare(password, userDataPresent.hashed_pass);
            if(passCheck)
            {
                return userDataPresent._id;
            }
            else
            {
                return -1;
            }
        }
        else
        {
            return -1;
        }
    }
}