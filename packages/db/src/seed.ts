import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Built-in Post Types
  const postType = await prisma.postType.upsert({
    where: { slug: 'post' },
    update: {},
    create: {
      slug: 'post',
      name: 'פוסטים',
      description: 'פוסטים לבלוג',
      icon: 'FileText',
      isBuiltIn: true,
      hasArchive: true,
      fields: {
        create: [
          { slug: 'content', label: 'תוכן', type: 'RICHTEXT', order: 1 },
          { slug: 'excerpt', label: 'תקציר', type: 'TEXTAREA', order: 2 },
          { slug: 'featuredImage', label: 'תמונה ראשית', type: 'IMAGE', order: 3 },
        ],
      },
    },
  });

  const pageType = await prisma.postType.upsert({
    where: { slug: 'page' },
    update: {},
    create: {
      slug: 'page',
      name: 'עמודים',
      description: 'עמודי אתר סטטיים',
      icon: 'File',
      isBuiltIn: true,
      hasArchive: false,
      fields: {
        create: [
          { slug: 'content', label: 'תוכן', type: 'RICHTEXT', order: 1 },
          { slug: 'featuredImage', label: 'תמונה ראשית', type: 'IMAGE', order: 2 },
        ],
      },
    },
  });

  const productType = await prisma.postType.upsert({
    where: { slug: 'product' },
    update: {},
    create: {
      slug: 'product',
      name: 'מוצרים',
      description: 'מוצרים לחנות',
      icon: 'ShoppingBag',
      isBuiltIn: true,
      hasArchive: true,
      fields: {
        create: [
          { slug: 'description', label: 'תיאור', type: 'RICHTEXT', order: 1 },
          { slug: 'price', label: 'מחיר', type: 'NUMBER', required: true, order: 2 },
          { slug: 'salePrice', label: 'מחיר מבצע', type: 'NUMBER', order: 3 },
          { slug: 'sku', label: 'SKU', type: 'TEXT', order: 4 },
          { slug: 'stock', label: 'מלאי', type: 'NUMBER', order: 5 },
          { slug: 'images', label: 'תמונות', type: 'GALLERY', order: 6 },
          { slug: 'category', label: 'קטגוריה', type: 'TEXT', order: 7 },
        ],
      },
    },
  });

  console.log('✅ Post types created:', postType.slug, pageType.slug, productType.slug);

  // Admin user — reads from env so create-nextpress credentials are used
  const adminEmail = process.env['ADMIN_EMAIL'] ?? 'admin@nextpress.dev';
  const adminPassword = process.env['ADMIN_PASSWORD'] ?? 'admin123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      name: 'מנהל מערכת',
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Default menu
  const menu = await prisma.menu.upsert({
    where: { slug: 'primary' },
    update: {},
    create: {
      name: 'תפריט ראשי',
      slug: 'primary',
      items: {
        create: [
          { label: 'ראשי', url: '/', order: 0 },
          { label: 'בלוג', url: '/blog', order: 1 },
          { label: 'חנות', url: '/shop', order: 2 },
          { label: 'אודות', url: '/about', order: 3 },
          { label: 'צור קשר', url: '/contact', order: 4 },
        ],
      },
    },
  });

  console.log('✅ Default menu created:', menu.slug);

  // Site options
  const siteTitle = process.env['SITE_TITLE'] ?? 'NextPress';
  const options = [
    { key: 'site_title', value: siteTitle, autoload: true },
    { key: 'site_description', value: `אתר ${siteTitle}`, autoload: true },
    { key: 'currency', value: 'ILS', autoload: true },
    { key: 'admin_email', value: adminEmail, autoload: true },
    { key: 'date_format', value: 'DD/MM/YYYY', autoload: true },
    { key: 'posts_per_page', value: '10', autoload: true },
  ];

  for (const opt of options) {
    await prisma.option.upsert({
      where: { key: opt.key },
      update: { value: opt.value },
      create: opt,
    });
  }

  console.log('✅ Site options seeded');
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
