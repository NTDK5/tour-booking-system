import mongoose, { Document, Model, Schema } from 'mongoose';

export type StaffRole = 'guide' | 'driver' | 'coordinator' | 'translator' | 'support';
export type StaffStatus = 'active' | 'inactive';
export type StaffAvailability = 'available' | 'assigned' | 'on_leave' | 'unavailable';

export interface IStaff extends Document {
    fullName: string;
    email?: string;
    phone?: string;
    avatar?: string;
    status: StaffStatus;
    role: StaffRole;
    availability: StaffAvailability;
    skills?: {
        languages?: string[];
        destinations?: string[];
        certifications?: string[];
        licenseTypes?: string[];
        vehicleTypes?: string[];
        departments?: string[];
    };
    hireDate?: Date;
    notes?: string;
    currentAssignmentsCount: number;
    lastAssignedAt?: Date;
    assignmentRefs?: {
        assignmentType: 'departure' | 'booking' | 'custom_trip' | 'other';
        assignmentId?: mongoose.Types.ObjectId;
        assignedAt?: Date;
    }[];
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const staffSchema = new Schema<IStaff>(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true, sparse: true },
        phone: { type: String, trim: true },
        avatar: { type: String, trim: true },
        status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
        role: {
            type: String,
            enum: ['guide', 'driver', 'coordinator', 'translator', 'support'],
            required: true,
            index: true,
        },
        availability: {
            type: String,
            enum: ['available', 'assigned', 'on_leave', 'unavailable'],
            default: 'available',
            index: true,
        },
        skills: {
            languages: [{ type: String, trim: true }],
            destinations: [{ type: String, trim: true }],
            certifications: [{ type: String, trim: true }],
            licenseTypes: [{ type: String, trim: true }],
            vehicleTypes: [{ type: String, trim: true }],
            departments: [{ type: String, trim: true }],
        },
        hireDate: { type: Date },
        notes: { type: String, maxlength: 2000 },
        currentAssignmentsCount: { type: Number, min: 0, default: 0 },
        lastAssignedAt: { type: Date },
        assignmentRefs: [
            {
                assignmentType: {
                    type: String,
                    enum: ['departure', 'booking', 'custom_trip', 'other'],
                    default: 'other',
                },
                assignmentId: { type: Schema.Types.ObjectId },
                assignedAt: { type: Date, default: Date.now },
            },
        ],
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

staffSchema.index({ fullName: 1 });
staffSchema.index({ role: 1, availability: 1, status: 1 });
staffSchema.index({ email: 1 }, { unique: true, sparse: true });

const Staff: Model<IStaff> =
    mongoose.models.Staff || mongoose.model<IStaff>('Staff', staffSchema, 'staff');

export default Staff;
