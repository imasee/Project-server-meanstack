const express = require("express");
const iRouter = express.Router();
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const Instructor = require('../../models/Instructor');
const passwordHash = require("../../utilities/hash_password");
const config = require('config');
const auth = require('../../utilities/auth');

//@route POST api/instructors
//@desc Register Instructor
//@access Public

iRouter.post('/',[
   
    check('name').not().isEmpty().withMessage('Name is required.').isLength({min: 5 ,max: 20}).withMessage('Name must be between 5 and 20'),
    check('email').not().isEmpty().withMessage('Email is required.').isEmail().withMessage('Invalid email').custom(value =>{
        return Instructor.findOne({email: value})
                .then(instrctr =>{
                    if(instrctr){
                       return Promise.reject('Email already in use');
                    }
                })
    }).withMessage('Email already in use.'),
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
           return res.status(400).json({error: err.array()});
        }

        const  { name,email,password,phone } = req.body;
        const instructor = new Instructor({
            name,
            password,
            email,
            phone
        });

        instructor.password = await passwordHash(password);
        console.log(instructor.toJSON());
        await instructor.save();

        const payload = {
            instructor: {
              id: instructor.id,
              name: instructor.name

            }
          };
        jwt.sign(
            payload,
            config.get("e-secret").toString(),{ expiresIn: 3600000 },
            (err,token)=>{
                if(err)
                    throw err;
                return res
                .json(token);
        });
    }
    catch(err){
        res.status(500).send(err.toString());
    }
});


//@route GET api/instructors
//@desc Retrieve all Instructor
//@access user
iRouter.get('/',auth,async (req,res)=>{
    try{
        const user = Instructor.findOne({_id:req.user.id});
        if(user){
            console.log("success");
            var instrctrList = await Instructor.find();
        }
        res.send(instrctrList);
        
        
    }
    catch(err){
        res.status(500).send(err);
    }
});


//@route GET api/instructors/getMyCourses
//@desc Retrieve all Courses related
//@access user
iRouter.get('/getMyCourses',auth,async (req,res)=>{
    try{
        var course = [];
        const user = await Instructor.findOne({_id:req.user.id});
        console.log(user.name);
        if(user){
            console.log("success");
            course = await Course.find({instructor:user._id});
        }
        res.send(course);
        //res.send(instrctrList);
        
        
    }
    catch(err){
        res.status(500).send(err);
    }
});


//@route GET api/instructors/getMyCourses
//@desc Retrieve all Courses related
//@access user
iRouter.get('/getCourse/:courseId',auth,async (req,res)=>{
    try{
        
        const user = await Instructor.findOne({_id:req.user.id});
        console.log(user.name+" d");
        console.log(req.params.courseId);
        if(user){
            console.log("success");
             var course = await Course.find({_id:req.params.courseId});
            res.send(course);
        }
        
        
        
    }
    catch(err){
        res.status(500).send(err);
    }
});

//@route GET api/instructors/getEnrolled
//@desc Retrieve all Students enrolled in the tutors class
//@access user
iRouter.get('/getStudents',auth,async (req,res)=>{
    try{
        var courseIdList = [];
        var rStudents = new Array();
        
        courseIdList = await Course.find({instructor:req.user.id},{_id:1});
        var students = await Student.find();
        await students.map(s=>{
            s.classes.map(async (val)=>{
                console.log(val.courseCode);
                
                for(var i = 0 ; i < courseIdList.length; i++){
                        if(new String(courseIdList[i]._id).valueOf() === new String(val.courseCode).valueOf()){
                          rStudents.push(s);
                        }
                }
            });
        });
        res.send({"students":rStudents});
        
        
    }
    catch(err){
        res.status(500).send(err);
    }
});

module.exports = iRouter;