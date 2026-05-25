import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['entrepreneur', 'investor'], required: true },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    isOnline: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    profile: {
      startupName: { type: String, default: '' },
      pitchSummary: { type: String, default: '' },
      fundingNeeded: { type: String, default: '' },
      industry: { type: String, default: '' },
      location: { type: String, default: '' },
      foundedYear: { type: Number },
      teamSize: { type: Number },
      investmentInterests: { type: [String], default: [] },
      investmentStage: { type: [String], default: [] },
      portfolioCompanies: { type: [String], default: [] },
      totalInvestments: { type: Number },
      minimumInvestment: { type: String, default: '' },
      maximumInvestment: { type: String, default: '' },
      preferences: {
        industries: { type: [String], default: [] },
        stages: { type: [String], default: [] },
        locations: { type: [String], default: [] }
      },
      history: { type: String, default: '' }
    },
    otp: {
      codeHash: { type: String },
      expiresAt: { type: Date }
    },
    reset: {
      tokenHash: { type: String },
      expiresAt: { type: Date }
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
        delete ret.passwordHash;
        delete ret.otp;
        delete ret.reset;
        if (ret.profile) {
          Object.assign(ret, ret.profile);
          delete ret.profile;
        }
        return ret;
      }
    }
  }
);

const User = mongoose.model('User', UserSchema);

export default User;
