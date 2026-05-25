import mongoose from 'mongoose';

const { Schema } = mongoose;

const MeetingSchema = new Schema(
  {
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: '' },
    notes: { type: String, default: '' },
    location: { type: String, default: '' },
    timeZone: { type: String, default: 'UTC' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending'
    }
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

const Meeting = mongoose.model('Meeting', MeetingSchema);

export default Meeting;
