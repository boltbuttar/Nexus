import mongoose from 'mongoose';

const { Schema } = mongoose;

const DocumentSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: { type: String, default: '' },
    size: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    url: { type: String, required: true },
    storageKey: { type: String, required: true },
    shared: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    status: { type: String, enum: ['draft', 'signed'], default: 'draft' },
    signatureUrl: { type: String, default: '' }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Document = mongoose.model('Document', DocumentSchema);

export default Document;
