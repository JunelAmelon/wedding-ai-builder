import { wishlistRepo, wishlistItemRepo } from '../lib/db/repositories/wishlistRepo';
import { userRepo } from '../lib/db/repositories/userRepo';

async function main() {
  const user = await userRepo.getByEmail('test-couple@example.com');
  if (!user) {
    console.error('No test couple found');
    return;
  }
  const lists = await wishlistRepo.getByCouple(user.id);
  let list = lists[0];
  if (!list) {
    list = await wishlistRepo.create({
      coupleId: user.id,
      title: 'Notre Liste de Mariage de Rêve',
      description: 'Merci de participer à notre nouvelle aventure à deux !',
      status: 'published',
      isPublic: true,
      bankDetails: null
    });
    await wishlistItemRepo.create({
      wishlistId: list.id,
      title: 'Voyage de Noces en Italie',
      description: 'Une semaine romantique sur la côte amalfitaine',
      category: 'voyage',
      price: 2500,
      collectedAmount: 750,
      currency: 'EUR',
      imageUrl: null,
      externalUrl: null,
      isCrowdfunded: true,
      status: 'partially_funded'
    });
    await wishlistItemRepo.create({
      wishlistId: list.id,
      title: 'Service de Vaisselle Porcelaine',
      description: 'Pour recevoir nos proches lors de doux dîners',
      category: 'maison',
      price: 180,
      collectedAmount: 180,
      currency: 'EUR',
      imageUrl: null,
      externalUrl: null,
      isCrowdfunded: false,
      status: 'funded'
    });
  }
  console.log('WISHLIST_SHARE_TOKEN=' + list.shareToken);
}

main().catch(console.error);
