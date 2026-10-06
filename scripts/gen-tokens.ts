import { createSession } from '../lib/auth';
import { userRepo } from '../lib/db/repositories/userRepo';
import { vendorProfileRepo } from '../lib/db/repositories/vendorProfileRepo';
import { projectRepo } from '../lib/db/repositories/projectRepo';

async function main() {
  let vendorUser = await userRepo.getByEmail('test-vendor@example.com');
  if (!vendorUser) {
    vendorUser = await userRepo.create({
      email: 'test-vendor@example.com',
      passwordHash: 'dummy',
      role: 'vendor',
      firstName: 'Pierre',
      lastName: 'Prestataire',
      emailVerified: true,
      avatarUrl: null,
      phone: '0612345678',
      address: null,
      googleId: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      resetToken: null,
      resetTokenExpiry: null,
      verifyToken: null,
      verifyTokenExpiry: null
    });
  }

  let profile = await vendorProfileRepo.getByUserId(vendorUser.id);
  if (!profile) {
    profile = await vendorProfileRepo.create({
      userId: vendorUser.id,
      companyName: 'Studio Photo Prestige',
      serviceCategory: 'photo',
      tier: 'pro',
      status: 'approved',
      phone: '0612345678',
      description: 'Photographe de mariage passionné',
      priceRange: { min: 1200, max: 2800, currency: 'EUR' },
      address: 'Paris',
      website: 'https://studiophoto.fr',
      instagram: '@studiophoto',
      portfolio: { images: [], videos: [], website: null, instagram: null, faq: [], reviews: [] },
      stripeCustomerId: null,
      subscriptionExpiresAt: null,
      notes: null,
      pricing: { travelCosts: null, depositPercentage: 30, cancellationPolicy: 'flexible' },
      faq: []
    });
  }

  let coupleUser = await userRepo.getByEmail('test-couple@example.com');
  if (!coupleUser) {
    coupleUser = await userRepo.create({
      email: 'test-couple@example.com',
      passwordHash: 'dummy',
      role: 'couple',
      firstName: 'Sophie',
      lastName: 'Martin',
      emailVerified: true,
      avatarUrl: null,
      phone: null,
      address: null,
      googleId: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      resetToken: null,
      resetTokenExpiry: null,
      verifyToken: null,
      verifyTokenExpiry: null
    });
  }

  let projects = await projectRepo.listByUser(coupleUser.id);
  if (projects.length === 0) {
    await projectRepo.create({
      userId: coupleUser.id,
      title: 'Mariage de Sophie & Thomas',
      weddingDate: '2027-06-20',
      totalBudget: 25000,
      guestCount: 100,
      city: 'Paris',
      country: 'France',
      style: 'Champêtre chic',
      status: 'planning',
      step: 'date'
    });
  }

  console.log('---START_TOKENS---');
  console.log('VENDOR_TOKEN=' + createSession(vendorUser));
  console.log('COUPLE_TOKEN=' + createSession(coupleUser));
  console.log('---END_TOKENS---');
}

main().catch(console.error);
