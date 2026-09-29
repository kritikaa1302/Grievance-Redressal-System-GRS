const mongoose = require('mongoose')

const complaintTypeSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }
},{
    timestamps:true
});

module.exports = mongoose.model("ComplaintType",complaintTypeSchema);