const mongoose = require('mongoose')

// A real login account for whoever actually handles complaints of a given
// type/department (e.g. the Hostel Warden handles "Hostel" complaints).
// Created by an admin via Manage Entities — there's no self-signup.
const staffSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    // The single department/category this staff member handles.
    // Complaints of this type are the ones offered for assignment to them.
    complaintType: {
        type: mongoose.Schema.ObjectId,
        ref: 'ComplaintType',
        required: true
    },
    // Lets an admin disable a staff account (e.g. someone leaves) without
    // deleting it and orphaning the complaints/audit-trail history that
    // reference them.
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Staff', staffSchema)
