import mongoose from 'mongoose';

const { Schema } = mongoose;

const CollaborationRequestSchema = new Schema(
  {
    investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    entrepreneurId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
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

const CollaborationRequest = mongoose.model('CollaborationRequest', CollaborationRequestSchema);

export default CollaborationRequest;
