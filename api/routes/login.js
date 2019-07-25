const express = require("express");
const iRouter = express.Router();
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const Instructor = require('../../models/Instructor');
const passwordHash = require("../../utilities/hash_password");
const config = require('config');
const auth = require('../../utilities/auth');
const bcrypt = require('bcryptjs');



iRouter.post('/s-login',async(req,res)=>{
    try{ 
        const {email,password} = req.body;
       
        const user = await Student.findOne({email:email});
        
        if(user){
            bcrypt.compare(password,user.password,(err,status)=>{
                console.log(status);
                if(status){
                    const payload = {
                        instructor: {
                          id: user.id,
                          name: user.name
            
                        }
                      };
                    jwt.sign(
                        payload,
                        config.get("e-secret").toString(),{ expiresIn: 3600000 },
                        (err,token)=>{
                            if(err)
                                throw err;
                                console.log(token);
                            return res
                            .json({"token":token,"status":true});
                    });
                    
               
                }
                else{
                    res
                    .json({"token":"","status":false});
                }
            });
        }
        else{
            res.json({"token":"","status":false});
        }

        
        
        
    }
    catch(err){
        res.status(500).send(err.toString());
    }
});

iRouter.post('/i-login',async(req,res)=>{
    try{ 
        const {email,password} = req.body;
       
        const user = await Instructor.findOne({email:email});
        
        if(user){
            bcrypt.compare(password,user.password,(err,status)=>{
                console.log(status);
                if(status){
                    const payload = {
                        instructor: {
                          id: user.id,
                          name: user.name
            
                        }
                      };
                    jwt.sign(
                        payload,
                        config.get("e-secret").toString(),{ expiresIn: 3600000 },
                        (err,token)=>{
                            if(err)
                                throw err;
                                console.log(token);
                            return res
                            .json({"token":token,"status":true});
                    });
                    
               
                }
                else{
                    res.json({"token":"","status":false});
                }
            });
        }
        else{
            res.json({"token":"","status":false});
        }

        
        
        
    }
    catch(err){
        res.status(500).send(err.toString());
    }
});

module.exports = iRouter;