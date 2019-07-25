const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  name : {
    type: String,
    required: true
  },
  password:{

      type: String,
      default:""

  },
  email: {
      type: String,
      unique: true,  
  },

  phone: {
    type: String,
    default:""
  },
  dateOfJoin: {
   
    type: Date,
    default: Date.now 
  },
  classes: [{
      courseCode: {
          type: Schema.Types.ObjectId,
          ref: 'courses'
    }  
  }]

});

module.exports = Student = mongoose.model("student", StudentSchema);