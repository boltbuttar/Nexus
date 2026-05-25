import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import User from './models/User.js';

const demoPassword = 'password123';

const demoUsers = [
  {
    name: 'Sarah Techwave',
    email: 'sarah@techwave.io',
    role: 'entrepreneur',
    avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Techwave&background=random',
    bio: 'Founder building next-generation collaboration tools for teams.',
    profile: {
      startupName: 'TechWave',
      pitchSummary: 'TechWave streamlines investor communications with automated reporting.',
      fundingNeeded: '500k',
      industry: 'SaaS',
      location: 'Lahore',
      foundedYear: 2022,
      teamSize: 8
    }
  },
  {
    name: 'Michael VC',
    email: 'michael@vcinnovate.com',
    role: 'investor',
    avatarUrl: 'https://ui-avatars.com/api/?name=Michael+VC&background=random',
    bio: 'Early-stage investor focused on B2B SaaS and fintech.',
    profile: {
      investmentInterests: ['SaaS', 'Fintech', 'AI'],
      investmentStage: ['Pre-seed', 'Seed'],
      portfolioCompanies: ['BridgePay', 'FlowTrack'],
      totalInvestments: 12,
      minimumInvestment: '25k',
      maximumInvestment: '250k'
    }
  }
];

const upsertUser = async (payload, passwordHash) => {
  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    existing.name = payload.name;
    existing.role = payload.role;
    existing.avatarUrl = payload.avatarUrl;
    existing.bio = payload.bio;
    existing.passwordHash = passwordHash;
    existing.profile = payload.profile;
    existing.twoFactorEnabled = false;
    await existing.save();
    return { email: payload.email, action: 'updated' };
  }

  await User.create({
    ...payload,
    passwordHash,
    twoFactorEnabled: false
  });
  return { email: payload.email, action: 'created' };
};

const run = async () => {
  try {
    await connectDb();
    const passwordHash = await bcrypt.hash(demoPassword, 10);

    const results = [];
    for (const user of demoUsers) {
      results.push(await upsertUser(user, passwordHash));
    }

    console.log('Seed complete:', results);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
