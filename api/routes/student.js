const express = require("express");
const iRouter = express.Router();
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const Instructor = require('../../models/Instructor');
const Course = require('../../models/Course');
const Student = require('../../models/Student');
const passwordHash = require("../../utilities/hash_password");
const config = require('config');
const auth = require('../../utilities/auth');

//@route POST api/students
//@desc add Student
//@access Public

iRouter.post('/',auth,[check('name').not().isEmpty().withMessage('Student ame is required.').isLength({min: 5 ,max: 20}).withMessage('Studentts name must be between 5 and 20'),
check('email').not().isEmpty().withMessage('Email is required.').isEmail().withMessage('Invalid email').custom((value) =>{
    return  Student.findOne({email: value})
            .then(instrctr =>{
                if(instrctr){
                   return Promise.reject('Email already in use');
                }
            })
}).withMessage('Email already in use.')],async(req,res,next)=>{
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
           return res.json({error: err.array()});
        }

        const user = Instructor.findOne({_id:req.user.id});
        console.log(user);
        if(user){
            console.log(req.user.id)
            const err = validationResult(req);
            if(!err.isEmpty()){
            return res.json({error: err.array()});
            }

            const  { email,name } = req.body;
            const student = new Student({
                name,
                email 
            });
           
            
            
            await student.save();
            var resStaus = {
                "status": true,
                "message":"Student "+student.name+" added"
            }
            res.send(resStaus);
        }
    }
    catch(err){
        res.status(500).send(err.toString());
    }
});



//@route GET api/classes
//@desc Retrieve all classes
//@access Public
iRouter.get('/',async (req,res)=>{
    try{
        console.log("success");
        var courseList = await Course.find();
        res.send(courseList);   
    }
    catch(err){
        res.status(500).send(err);
    }
});



//@route GET api/students/courseId
//@desc Retrieve a course
//@access public
iRouter.get('/:courseId',async (req,res)=>{
    try{
        const course = Course.findOne({_id:req.params.courseId});
        console.log("success");
        if(course){
            var instructor = Instructor.findOne({_id:course.instructor});
            if(instructor){
                var courseDetails = {
                    course,
                    instructor
                }
                res.send(courseDetails);
            }
            res.send(course);  
        }
        res.send("Course not found!");  
        
         
    }
    catch(err){
        res.status(500).send(err);
    }
});


//@route POST api/students/register
//@desc Retrieve a course
//@access public
iRouter.post('/register',[ 
    check('name').not().isEmpty().withMessage('Name is required.').isLength({min: 5 ,max: 20}).withMessage('Name must be between 5 and 20'),
    check('email').not().isEmpty().withMessage('Email is required.').isEmail().withMessage('Invalid email').custom(value =>{
        return Student.findOne({email: value})
                .then(instrctr =>{
                    if(!instrctr){
                       return Promise.reject('Email already in use');
                    }
                })
    }).withMessage('Email not registered,contact administrator.'),
    check('password').not().isEmpty().withMessage('Password is required.').isLength({min: 6,max:20}).withMessage('Password must be between 6 and 20'),
    check('confirmPassword').not().isEmpty().withMessage('Confirm Password is required.').isLength({min: 6,max:20}).withMessage('Confirm Password must be between 6 and 20')
        .custom((value,{req}) =>{
                if(value !== req.body.password){
                    return Promise.reject('Password doesnot match.');
                }
                else{
                    return Promise.resolve();
                }
        }).withMessage('Password doesnot match.'),
    check('phone').not().isEmpty().withMessage('Phone is required.').isMobilePhone("any").withMessage('Invalid number format')
],async(req,res,next)=>{
    try{
        const err = validationResult(req);
        if(!err.isEmpty()){
           return res.json({error: err.array()});
        }

        const  { name,email,password,phone } = req.body;
        const student = {
            name,
            password,
            phone
        };
        const id = await Student.findOne({email: email},{"_id":1});
        student.password = await passwordHash(password);
        console.log(id);
        
        await Student.findOneAndUpdate({_id:id},{$set:student});

        const payload = {
            instructor: {
              id: id._id,
              name: student.name

            }
          };
        jwt.sign(
            payload,
            config.get("e-secret").toString(),{ expiresIn: 3600000 },
            (err,token)=>{
                if(err)
                    throw err;
                return res.json({status:true,token:token});
        });
    }
    catch(err){
        res.status(500).send(err.toString());
    }
});



//@route post api/classes/courseRegister?courseId
//@desc Retrieve a course
//@access user
iRouter.post('/courseRegister/:courseId',auth,async (req,res)=>{
    try{
        var exists = false;
        var user = await Student.findOne({_id:req.user.id});
        var course;
        console.log(user.classes[0]);
        for(var i = 0; i<user.classes.length; i++){
            if(new String(user.classes[i].courseCode).valueOf() === new String(req.params.courseId).valueOf()){
                exists = true;
                break;
            }
            else{
                exists = false;
            }
        }
          
        
            if(user){
                if(!exists){
                    course = await Course.findOne({_id:req.params.courseId});
                        console.log("success");
                        if(course){
                        
                            
                            await Student.findOneAndUpdate({_id:req.user.id},{ "$push": { "classes": { "courseCode": course._id } }});
                            res.send({status:{
                                "status":true,
                                "message":"Success fully added a new course."
                            }});
                        }
                        else{
                            res.send({status:{
                                "status":false,
                                "message":"course not found."
                            }}); 
                        }
                        
                    }
                    else{
                        res.send({status:{
                            "status":false,
                            "message":"course already registered."
                        }});
                    }
        }

        else{
            res.send({status:{
                "status":false,
                "message":"user not found."
            }}); 
        }
         
        
         
    }
    catch(err){
        res.status(500).send(err);
    }
});


//@route post api/classes/courseRegister?courseId
//@desc Retrieve a course
//@access user
iRouter.post('/removeCourse/:courseId',auth,async (req,res)=>{
    try{

        var user = await Student.findOne({_id:req.user.id});
        var course;
        console.log(req.user.id);
        if(user){
           course = await Course.findOne({_id:req.params.courseId});
            console.log("success");
            if(course){
             
                
                await Student.findOneAndUpdate({_id:req.user.id},{ "$pull": { "classes": { "courseCode": course._id } }});
                res.send({status:{
                    "status":true,
                    "message":"Success fully removed course."
                }});
            }
            else{
                res.send({status:{
                    "status":false,
                    "message":"course not found."
                }});
            }
            
        }
        else{
            res.send({status:{
                "status":false,
                "message":"user not found."
            }}); 
        }
         
        
         
    }
    catch(err){
        res.status(500).send(err);
    }
});


//@route get api/students/registeredCourse
//@desc Retrieve registered courses
//@access user
iRouter.post("/registeredClasses",auth,async (req,res)=>{
    try{
       
        var user = await Student.findOne({_id:req.user.id});
        var coursesList =[];
        if(user){
            
           for(var i =0 ; i<user.classes.length; i++){
               
           var course =  await Course.findOne({_id:user.classes[i].courseCode});
          
                 coursesList.push(course);
           }
                
           res.send({"registered":coursesList});
            
        }
        else{
            res.send({status:{
                "status":false,
                "message":"user not found."
            }}); 
        }
        
         
        
         
    }
    catch(err){
        res.status(500).send(err);
    }
})

module.exports = iRouter;