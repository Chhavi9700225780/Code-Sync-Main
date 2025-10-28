import mongoose, { Schema, Document } from 'mongoose';

// Interface for the document structure, including new fields
export interface IUser extends Document {
    appUserId: string;
    username: string;
    email?: string; // <-- Make email optional in the interface
    password?: string; // <-- Make password optional
    githubId?: string;
    githubAccessToken?: string;
}

const UserSchema: Schema = new Schema({
    appUserId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    // Make email unique and lowercase, but NOT required at schema level
    email: { 
        type: String, 
        // required: false, // Explicitly false or remove 'required'
        unique: true, 
        sparse: true, // Allows multiple null/undefined values but unique actual emails
        lowercase: true 
    },
    // Make password NOT required at schema level
    password: { 
        type: String, 
        // required: false, 
        select: false 
    }, 
    githubId: { type: String, unique: true, sparse: true }, // sparse: true helps with uniqueness when null
    githubAccessToken: { type: String },
}, { timestamps: true });


// Add a pre-save hook to ensure email is present for non-GitHub users if needed
// Or handle this logic where you create local users (registerUser)
/*
UserSchema.pre<IUser>('save', function (next) {
    if (!this.githubId && !this.email) {
        next(new Error('Email is required for local accounts.'));
    } else if (!this.githubId && !this.password) {
         next(new Error('Password is required for local accounts.'));
    }
    else {
        next();
    }
});
*/



export default mongoose.model('User', UserSchema);