import mongoose from 'mongoose';

const { Schema } = mongoose;

const DealSchema = new Schema(
  {
    investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    entrepreneurId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startupName: { type: String, required: true },
    startupLogo: { type: String, default: '' },
    industry: { type: String, default: '' },
    amount: { type: String, default: '' },
    equity: { type: String, default: '' },
    status: { type: String, default: 'Due Diligence' },
    stage: { type: String, default: '' },
    lastActivity: { type: Date, default: Date.now }
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

const Deal = mongoose.model('Deal', DealSchema);

export default Deal;
