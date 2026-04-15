import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IResource extends Document {
    resourceType: 'Lodge' | 'Tour' | 'Car' | 'Guide' | 'Service';
    sourceModel: 'Lodge' | 'Tour' | 'Car' | 'Custom';
    sourceId?: mongoose.Types.ObjectId;
    name: string;
    metadata?: Record<string, any>;
    constraints?: {
        maxCapacity?: number;
        minLeadHours?: number;
        requiresManualApproval?: boolean;
    };
    isActive: boolean;
}

const resourceSchema: Schema<IResource> = new Schema(
    {
        resourceType: {
            type: String,
            enum: ['Lodge', 'Tour', 'Car', 'Guide', 'Service'],
            required: true,
        },
        sourceModel: {
            type: String,
            enum: ['Lodge', 'Tour', 'Car', 'Custom'],
            required: true,
        },
        sourceId: {
            type: Schema.Types.ObjectId,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        constraints: {
            maxCapacity: { type: Number, min: 1 },
            minLeadHours: { type: Number, min: 0 },
            requiresManualApproval: { type: Boolean, default: false },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

resourceSchema.index({ resourceType: 1, name: 1 });
resourceSchema.index({ sourceModel: 1, sourceId: 1 }, { unique: true, sparse: true });

const Resource: Model<IResource> = mongoose.model<IResource>('Resource', resourceSchema);
export default Resource;
