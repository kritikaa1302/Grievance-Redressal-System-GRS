const mongoose = require('mongoose')

const noteSchema = mongoose.Schema({
    // 'status_change' and 'assignment' entries are logged automatically
    // whenever an admin updates a complaint's status or who it's assigned
    // to — these form an immutable audit trail. 'note' entries are
    // free-text comments an admin can leave (and delete) at any time.
    type: {
        type: String,
        enum: ['note', 'status_change', 'assignment'],
        default: 'note'
    },
    text: {
        type: String
    },
    fromStatus: {
        type: String
    },
    toStatus: {
        type: String
    },
    fromAssignee: {
        type: String
    },
    toAssignee: {
        type: String
    },
    // Email the assignment notification was sent to (if any) at the
    // time this audit entry was recorded.
    toAssigneeEmail: {
        type: String
    },
    addedByEmail: {
        type: String
    }
}, {
    timestamps: true
});

const attachmentSchema = mongoose.Schema({
    url: { type: String, required: true },
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number }
}, {
    timestamps: true
});

// A single message in the two-way conversation between the student and
// whichever admin is handling their complaint. Separate from `notes`,
// which are internal-only and never shown to the student.
const messageSchema = mongoose.Schema({
    sender: {
        type: String,
        enum: ['student', 'admin'],
        required: true
    },
    senderName: {
        type: String
    },
    text: {
        type: String
    },
    attachment: attachmentSchema
}, {
    timestamps: true
});

const complaintSchema  = mongoose.Schema({
    complaintType:{
        type:mongoose.Schema.ObjectId,
        ref:"ComplaintType"
    },
    complaint:{
        type:String,
        required:true
    },
    studentId:{
        type:mongoose.Schema.ObjectId,
        ref:"Student"
    },
    status:{
        type:String,
        enum:['notProcessed','pending','closed'],
        default:'notProcessed'
    },
    // Free-text label for who's responsible for resolving this — e.g.
    // "Hostel Warden - Mr. Sharma". Kept as a fallback/display copy even
    // when assignedStaffId is set (auto-filled from the staff record),
    // so old data and complaint types with no registered staff yet still
    // work.
    assignedTo:{
        type:String,
        default:''
    },
    // Contact email tied to assignedTo. Auto-filled from the Staff
    // record when assignedStaffId is set; can also be set manually for
    // the free-text fallback case (no matching staff account yet).
    assignedToEmail:{
        type:String,
        default:''
    },
    // When set, this complaint is assigned to a real Staff account, not
    // just a free-text label — that account can log in and see/act on
    // this complaint from their own dashboard.
    assignedStaffId:{
        type:mongoose.Schema.ObjectId,
        ref:"Staff",
        default:null
    },
    // Files attached when the complaint was originally submitted.
    attachments:{
        type:[attachmentSchema],
        default:[]
    },
    // Two-way conversation visible to both the student and admins.
    messages:{
        type:[messageSchema],
        default:[]
    },
    notes:{
        type:[noteSchema],
        default:[]
    }
},{
    timestamps:true
});
module.exports = mongoose.model('Complaint',complaintSchema)