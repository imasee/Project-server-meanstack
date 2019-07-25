const express = require("express");
const iRouter = express.Router();
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator/check');
const Instructor = require('../../models/Instructor');
const Course = require('../../models/Course');
const passwordHash = require("../../utilities/hash_password");
const config = require('config');
const auth = require('../../utilities/auth');

//@route POST api/instructors
//@desc Register Instructor
//@access Public

iRouter.post('/',auth,[
   
    check('title').not().isEmpty().withMessage('Course title is required.').isLength({min: 3 ,max: 20}).withMessage('Name must be between 3 and 20'),
    ],async(req,res,next)=>{
    try{
        const user = await Instructor.findOne({_id:req.user.id});
        if(user){
            console.log(req.user.id)
            const err = validationResult(req);
            if(!err.isEmpty()){
            return res.json({error: err.array()});
            }

            const  { title,description } = req.body;
            var instructor = req.user.id;
            const course = new Course({
                title,
                description,
                instructor 
            });
           await course.save(function(err,cid){
            console.log("course:"+cid);
           });
            await Instructor.findByIdAndUpdate({_id:user._id},{ "courseOffering": { "courseName": course.title,"courseCode":course._id } });
            var resStaus = {
                "status": true,
                "message":"Course "+course.title+" created"
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
iRouter.get('/list',async (req,res)=>{
    try{
        console.log("success");
        var courseList = await Course.find({},{"_id":0,"title":1,"description":1});
        res.send(courseList);   
    }
    catch(err){
        res.status(500).send(err);
    }
});

//@route GET api/classes
//@desc Retrieve all classes
//@access Users
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



//@route GET api/classes?courseId
//@desc Retrieve a course
//@access Public
iRouter.get('/:courseId',auth,async (req,res)=>{
    try{
        const course = await Course.findOne({_id:req.params.courseId});
        console.log(course);
        var result = {
            "course":null,
            "instructor":null
        };

        if(course){
            var instructor = await Instructor.findOne({_id:course.instructor});
            console.log(instructor); 
            result.course = course; 
            if(instructor){
                result.instructor = instructor;
                }
                
            }
            res.send(result);
         
    }
    catch(err){
        res.status(500).send(err);
    }
});

module.exports = iRouter;