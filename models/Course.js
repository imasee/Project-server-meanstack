const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    title: {
		type: String
	},
	description: {
		type: String
	},
	instructor:{
        type: Schema.Types.ObjectId,
        ref: 'instructors'
	}
	/*lessons:[{
		lesson_number: {type: Number},
		lesson_title: {type: String},
		lesson_body:{type: String}
	}]*/

});

module.exports = Course = mongoose.model("course", CourseSchema);