import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './modules/user/user.model.js';

dotenv.config();

export const seedSuperAdmin = async () => {
  try {
    const superAdminExists = await User.findOne({ role: 'Super Admin' });

    if (!superAdminExists) {
      console.log('Seeding Super Admin user...');
      const name = process.env.SUPERADMIN_NAME || 'Super Admin';
      const email = process.env.SUPERADMIN_EMAIL || 'superadmin@edusphere.com';
      const password = process.env.SUPERADMIN_PASSWORD || 'SuperAdmin123!';

      await User.create({
        name,
        email,
        password,
        role: 'Super Admin',
        // Super Admin does not require an institute field
      });

      console.log('----------------------------------------------------');
      console.log('Super Admin successfully seeded!');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log('----------------------------------------------------');
    } else {
      console.log('Super Admin account already exists. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error.message);
  }
};

// Running script directly
if (process.argv[1] === import.meta.url || process.argv[1]?.endsWith('seed.js')) {
  const runSeed = async () => {
    await connectDB();
    await seedSuperAdmin();
    process.exit(0);
  };
  runSeed();
}
