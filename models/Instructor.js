const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InstructorSchema = new Schema({
  name : {
    type: String,
    required: true
  },
  password:{

      type: String,
      required: true,
      minlength: 6

  },
  email: {
      type: String,
      required:  true,
      unique: true,  
  },

  phone: {
    type: String,
    default:  "",
    minlength: 10,
    maxlength: 10
  },
  dateOfJoin: {
   
    type: Date,
    default: Date.now 
  },
  courseOffering: [{
      courseName: String,
      courseCode: {
          type: Schema.Types.ObjectId,
          ref: 'courses'
    }
  }],
  isActive :{
      type: Boolean,
      default: false
  }

});

module.exports = Instructor = mongoose.model("instructor", InstructorSchema);