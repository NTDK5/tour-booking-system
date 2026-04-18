import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    first_name?: string;
    last_name?: string;
    name?: string; // Added for compatibility with Passport/OAuth
    /** Display name for dashboards / seeded admin profiles */
    fullName?: string;
    email: string;
    password?: string;
    country?: string;
    profile_pic?: string;
    verificationToken?: string;
    verified: boolean;
    role: 'user' | 'admin';
    /** Fine-grained capabilities for enterprise admin UX (optional). */
    permissions?: string[];
    /** Account lifecycle — distinct from booking status. */
    status?: 'active' | 'inactive' | 'suspended';
    googleId?: string;
    refreshToken?: string; // Stored hashed
    matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema(
    {
        first_name: { type: String, required: false },
        last_name: { type: String, required: false },
        name: { type: String, required: false },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        country: { type: String },
        profile_pic: { type: String },
        verificationToken: { type: String },
        verified: { type: Boolean, default: false },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        fullName: { type: String, trim: true },
        permissions: [{ type: String, trim: true }],
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active',
        },
        googleId: { type: String },
        refreshToken: { type: String },
    },
    {
        timestamps: true,
    }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    if (this.password) {
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
