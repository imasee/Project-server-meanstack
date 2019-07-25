const bcrypt = require('bcryptjs');

const passwordHash = async function (password) {
    try{
         return new Promise((resolve,reject)=>{
             bcrypt.hash(password,10,(err,hash)=>{
                if(err){
                    console.log(err);
                    reject(err);
                }
                else{
                    resolve(hash);
                }
            });
         });     
    }
    catch(err){
        console.log(err);
    }
}

module.exports = passwordHash;