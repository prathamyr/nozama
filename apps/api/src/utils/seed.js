// Load env vars first before any other requires
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Cart = require('../models/cart.model');
const Order = require('../models/order.model');
const InventoryLog = require('../models/inventorylog.model');

// Sample laptop data
const laptops = [
  {
    name: "ThinkPad X1 Carbon Gen 13 Intel (14'') Aura Edition",
    slug: "thinkpad-x1-carbon-gen-13",
    category: "business",
    brand: "Lenovo",
    description: "Premium business ultrabook with Intel Aura Edition. Lightweight, powerful, and built for productivity.",
    price: 1899,
    specs: {
      "Processor": "Intel Core Ultra 7",
      "RAM": "16GB LPDDR5",
      "Storage": "512GB NVMe SSD",
      "Display": "14\" WUXGA (1920x1200)",
      "Graphics": "Intel Arc Graphics",
      "Battery": "Up to 15 hours",
      "Weight": "2.48 lbs"
    },
    thumbnailImg: "/laptops/ThinkPad X1 Carbon Gen 13 Intel (14'') Aura Edition/fcd70qdguca5etsxhgazpeezkoam7p488088.avif",
    imageGallery: [
      { url: "/laptops/ThinkPad X1 Carbon Gen 13 Intel (14'') Aura Edition/fcd70qdguca5etsxhgazpeezkoam7p488088.avif", type: "image" },
      { url: "/laptops/ThinkPad X1 Carbon Gen 13 Intel (14'') Aura Edition/rhsf80lak4xxtfgv19qaixylxu8aov681050.avif", type: "image" },
      { url: "/laptops/ThinkPad X1 Carbon Gen 13 Intel (14'') Aura Edition/s6ipe83zyup65q7s29pyv6ch52s07x509330.avif", type: "image" },
      { url: "/laptops/ThinkPad X1 Carbon Gen 13 Intel (14'') Aura Edition/yd5dqi756ec0vr9a09fhc5s90tx4l6387783.avif", type: "image" }
    ],
    stockQuantity: 15,
    lowStockThreshold: 5,
    averageRating: 4.7,
    reviewCount: 34,
    isActive: true
  },
  {
    name: "Yoga Slim 7x (14'' Snapdragon)",
    slug: "yoga-slim-7x-snapdragon",
    category: "ultrabook",
    brand: "Lenovo",
    description: "Ultra-thin Copilot+ PC with Snapdragon X Elite processor. Perfect blend of performance and portability.",
    price: 1299,
    specs: {
      "Processor": "Snapdragon X Elite",
      "RAM": "16GB LPDDR5x",
      "Storage": "512GB NVMe SSD",
      "Display": "14.5\" 3K OLED (2944x1840)",
      "Graphics": "Qualcomm Adreno",
      "Battery": "Up to 20 hours",
      "Weight": "2.82 lbs"
    },
    thumbnailImg: "/laptops/Yoga Slim 7x(14'' Snapdragon)/lenovo-yoga-slim-7x-copilot.webp",
    imageGallery: [
      { url: "/laptops/Yoga Slim 7x(14'' Snapdragon)/lenovo-yoga-slim-7x-copilot.webp", type: "image" },
      { url: "/laptops/Yoga Slim 7x(14'' Snapdragon)/4hwawby6tv3888c6jekskdwpna18gr740426.avif", type: "image" },
      { url: "/laptops/Yoga Slim 7x(14'' Snapdragon)/5qj1ytyqu30lnln67imlwsh8ch107p018507.avif", type: "image" },
      { url: "/laptops/Yoga Slim 7x(14'' Snapdragon)/7c0m2xdkdbyxs0ibd7erpx9tlcovng883092.avif", type: "image" }
    ],
    stockQuantity: 20,
    lowStockThreshold: 5,
    averageRating: 4.5,
    reviewCount: 28,
    isActive: true
  },
  {
    name: "LOQ (15'' AMD) with up to RTX 5060",
    slug: "loq-15-amd-rtx-5060",
    category: "gaming",
    brand: "Lenovo",
    description: "Powerful gaming laptop with AMD Ryzen processor and NVIDIA RTX 5060 graphics. Dominate every game.",
    price: 1399,
    specs: {
      "Processor": "AMD Ryzen 7 8845HS",
      "RAM": "16GB DDR5",
      "Storage": "1TB NVMe SSD",
      "Display": "15.6\" FHD (1920x1080) 144Hz",
      "Graphics": "NVIDIA GeForce RTX 5060 8GB",
      "Battery": "Up to 6 hours",
      "Weight": "5.07 lbs"
    },
    thumbnailImg: "/laptops/LOQ (15'' AMD) with up to RTX 5060)/loq-15ahp10-gaming-laptop-v1.avif",
    imageGallery: [
      { url: "/laptops/LOQ (15'' AMD) with up to RTX 5060)/loq-15ahp10-gaming-laptop-v1.avif", type: "image" },
      { url: "/laptops/LOQ (15'' AMD) with up to RTX 5060)/loq-15ahp10-gaming-laptop-v2.avif", type: "image" },
      { url: "/laptops/LOQ (15'' AMD) with up to RTX 5060)/loq-15ahp10-gaming-laptop-v6.avif", type: "image" },
      { url: "/laptops/LOQ (15'' AMD) with up to RTX 5060)/w4d2dc0um83w19y6vflp9isfmtwi3q131530.avif", type: "image" }
    ],
    stockQuantity: 8,
    lowStockThreshold: 3,
    averageRating: 4.6,
    reviewCount: 42,
    isActive: true
  },
  {
    name: "Yoga 7i 2-in-1 (16'' Intel)",
    slug: "yoga-7i-2in1-16-intel",
    category: "2-in-1",
    brand: "Lenovo",
    description: "Versatile 2-in-1 convertible laptop with 16-inch display. Work, create, and entertain with ease.",
    price: 1499,
    specs: {
      "Processor": "Intel Core Ultra 7 155H",
      "RAM": "16GB LPDDR5x",
      "Storage": "1TB NVMe SSD",
      "Display": "16\" WUXGA (1920x1200) Touch",
      "Graphics": "Intel Arc Graphics",
      "Battery": "Up to 14 hours",
      "Weight": "4.63 lbs"
    },
    thumbnailImg: "/laptops/Yoga 7i 2-in-1(16 Intel)/lenovo-yoga-7i-2-in-1-16inch.avif",
    imageGallery: [
      { url: "/laptops/Yoga 7i 2-in-1(16 Intel)/lenovo-yoga-7i-2-in-1-16inch.avif", type: "image" },
      { url: "/laptops/Yoga 7i 2-in-1(16 Intel)/hwcl76zgfupr4pam376uggf4qxq4mg030851.webp", type: "image" },
      { url: "/laptops/Yoga 7i 2-in-1(16 Intel)/jmeo3ah3h2ze5z4n8omp31omq9cvwj008136.avif", type: "image" },
      { url: "/laptops/Yoga 7i 2-in-1(16 Intel)/zedmls8isdcmr6920lwwsg0x4pklf1329096.avif", type: "image" }
    ],
    stockQuantity: 12,
    lowStockThreshold: 4,
    averageRating: 4.4,
    reviewCount: 31,
    isActive: true
  },
  {
    name: "Lenovo Slim 7i Aura Edition (14'' Intel)",
    slug: "slim-7i-aura-14-intel",
    category: "ultrabook",
    brand: "Lenovo",
    description: "Sleek and powerful ultrabook with Intel Aura Edition. Premium design meets exceptional performance.",
    price: 1599,
    specs: {
      "Processor": "Intel Core Ultra 7 258V",
      "RAM": "32GB LPDDR5x",
      "Storage": "1TB NVMe SSD",
      "Display": "14\" 2.8K OLED (2880x1800)",
      "Graphics": "Intel Arc Graphics 140V",
      "Battery": "Up to 17 hours",
      "Weight": "2.87 lbs"
    },
    thumbnailImg: "/laptops/Lenovo Slim 7i Aura Edition (14'' Intel)/lenovo-slim-7i-gen-10-v1.webp",
    imageGallery: [
      { url: "/laptops/Lenovo Slim 7i Aura Edition (14'' Intel)/lenovo-slim-7i-gen-10-v1.webp", type: "image" },
      { url: "/laptops/Lenovo Slim 7i Aura Edition (14'' Intel)/lenovo-slim-7i-gen-10-v2.avif", type: "image" },
      { url: "/laptops/Lenovo Slim 7i Aura Edition (14'' Intel)/lenovo-slim-7i-gen-10-v6.avif", type: "image" },
      { url: "/laptops/Lenovo Slim 7i Aura Edition (14'' Intel)/26865424089_Slim_7_14ILL10_202412060521221740331825795.avif", type: "image" }
    ],
    stockQuantity: 10,
    lowStockThreshold: 3,
    averageRating: 4.8,
    reviewCount: 19,
    isActive: true
  }
];

// Default users
const adminUser = {
  firstname: "Admin",
  lastname: "User",
  email: "admin@nozama.com",
  role: "admin"
};

const customerUser = {
  firstname: "Test",
  lastname: "Customer",
  email: "customer@nozama.com",
  role: "customer",
  shippingAddress: {
    addressType: "shipping",
    fullName: "Test Customer",
    line1: "123 Main Street",
    line2: "Apt 4B",
    city: "Toronto",
    state: "ON",
    postalCode: "M5V 2H1",
    country: "Canada"
  },
  billingAddress: {
    addressType: "billing",
    fullName: "Test Customer",
    line1: "123 Main Street",
    line2: "Apt 4B",
    city: "Toronto",
    state: "ON",
    postalCode: "M5V 2H1",
    country: "Canada"
  },
  paymentMethods: [
    {
      cardBrand: "Visa",
      last4: "4242",
      expiryMonth: 12,
      expiryYear: 2026,
      label: "Personal Visa",
      isDefault: true
    }
  ]
};

// CLI flags
const RESET = process.argv.includes('--reset');
const FORCE = process.argv.includes('--force');

async function seedDatabase() {
  if (!process.env.MONGO_URI) {
    console.error('[ERROR] MONGO_URI not set. Check apps/api/.env');
    process.exit(1);
  }

  try {
    console.log('[SEED] Starting database seed...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[OK] Connected to MongoDB');

    // Wipe collections if --reset flag
    if (RESET) {
      console.log('[RESET] Clearing all collections...');
      await Product.deleteMany({});
      await User.deleteMany({});
      await Cart.deleteMany({});
      await Order.deleteMany({});
      await InventoryLog.deleteMany({});
      console.log('[RESET] Collections cleared');
    }

    // --- SEED PRODUCTS ---
    console.log('[SEED] Seeding products...');
    const productIds = {}; // store refs for later use
    for (const p of laptops) {
      let product = await Product.findOne({ slug: p.slug });
      if (!product) {
        product = await Product.create(p);
      } else if (FORCE) {
        await Product.updateOne({ slug: p.slug }, { $set: p });
      }
      productIds[p.slug] = product._id;
    }
    console.log(`[OK] Products seeded (${laptops.length} items)`);

    // --- SEED USERS ---
    console.log('[SEED] Seeding users...');
    const adminPlain = process.env.SEED_ADMIN_PASSWORD || 'admin123';
    const customerPlain = process.env.SEED_CUSTOMER_PASSWORD || 'Customer@123';

    const adminHash = await bcrypt.hash(adminPlain, 10);
    const customerHash = await bcrypt.hash(customerPlain, 10);

    // Upsert admin
    const adminResult = await User.findOneAndUpdate(
      { email: adminUser.email },
      { $set: { ...adminUser, passwordHash: adminHash } },
      { upsert: true, new: true }
    );

    // Upsert customer
    const customerResult = await User.findOneAndUpdate(
      { email: customerUser.email },
      { $set: { ...customerUser, passwordHash: customerHash } },
      { upsert: true, new: true }
    );
    console.log('[OK] Users seeded');

    // --- SEED CART (sample cart for customer) ---
    console.log('[SEED] Seeding carts...');
    const existingCart = await Cart.findOne({ userId: customerResult._id, status: 'open' });
    if (!existingCart || FORCE) {
      await Cart.findOneAndUpdate(
        { userId: customerResult._id, status: 'open' },
        {
          $set: {
            userId: customerResult._id,
            status: 'open',
            items: [
              { productId: productIds['yoga-slim-7x-snapdragon'], quantity: 1 },
              { productId: productIds['loq-15-amd-rtx-5060'], quantity: 2 }
            ]
          }
        },
        { upsert: true, new: true }
      );
    }
    console.log('[OK] Carts seeded');

    // --- SEED ORDERS (sample past orders) ---
    console.log('[SEED] Seeding orders...');
    const existingOrders = await Order.countDocuments({ user: customerResult._id });
    if (existingOrders === 0 || FORCE) {
      // Clear old orders if forcing
      if (FORCE) await Order.deleteMany({ user: customerResult._id });

      const sampleAddress = {
        fullName: "Test Customer",
        line1: "123 Main Street",
        line2: "Apt 4B",
        city: "Toronto",
        state: "ON",
        postalCode: "M5V 2H1",
        country: "Canada"
      };

      // Order 1: Delivered
      await Order.create({
        user: customerResult._id,
        userEmail: customerUser.email,
        itemsOrdered: [
          {
            productId: productIds['thinkpad-x1-carbon-gen-13'],
            productName: laptops[0].name,
            productPrice: laptops[0].price,
            thumbnailImg: laptops[0].thumbnailImg,
            quantity: 1
          }
        ],
        subtotal: 1899,
        taxPrice: 246.87,
        shippingPrice: 0,
        totalAmount: 2145.87,
        shippingAddress: sampleAddress,
        billingAddress: sampleAddress,
        billingInfo: { lastFourDigits: "4242", cardBrand: "Visa" },
        orderStatus: "delivered",
        paymentDetails: {
          transactionId: "TXN_" + Date.now() + "_001",
          paymentStatus: "Approved",
          paymentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      });

      // Order 2: Processing
      await Order.create({
        user: customerResult._id,
        userEmail: customerUser.email,
        itemsOrdered: [
          {
            productId: productIds['slim-7i-aura-14-intel'],
            productName: laptops[4].name,
            productPrice: laptops[4].price,
            thumbnailImg: laptops[4].thumbnailImg,
            quantity: 1
          },
          {
            productId: productIds['yoga-7i-2in1-16-intel'],
            productName: laptops[3].name,
            productPrice: laptops[3].price,
            thumbnailImg: laptops[3].thumbnailImg,
            quantity: 1
          }
        ],
        subtotal: 3098,
        taxPrice: 402.74,
        shippingPrice: 0,
        totalAmount: 3500.74,
        shippingAddress: sampleAddress,
        billingAddress: sampleAddress,
        billingInfo: { lastFourDigits: "4242", cardBrand: "Visa" },
        orderStatus: "processing",
        paymentDetails: {
          transactionId: "TXN_" + Date.now() + "_002",
          paymentStatus: "Approved",
          paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      });

      // Order 3: Cancelled (for history variety)
      await Order.create({
        user: customerResult._id,
        userEmail: customerUser.email,
        itemsOrdered: [
          {
            productId: productIds['loq-15-amd-rtx-5060'],
            productName: laptops[2].name,
            productPrice: laptops[2].price,
            thumbnailImg: laptops[2].thumbnailImg,
            quantity: 1
          }
        ],
        subtotal: 1399,
        taxPrice: 181.87,
        shippingPrice: 0,
        totalAmount: 1580.87,
        shippingAddress: sampleAddress,
        billingAddress: sampleAddress,
        billingInfo: { lastFourDigits: "4242", cardBrand: "Visa" },
        orderStatus: "cancelled",
        paymentDetails: {
          transactionId: "TXN_" + Date.now() + "_003",
          paymentStatus: "Refunded",
          paymentDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
        }
      });
    }
    console.log('[OK] Orders seeded');

    // --- SEED INVENTORY LOGS ---
    console.log('[SEED] Seeding inventory logs...');
    const existingLogs = await InventoryLog.countDocuments();
    if (existingLogs === 0 || FORCE) {
      if (FORCE) await InventoryLog.deleteMany({});

      // Sample restock logs by admin
      const logEntries = [
        {
          productId: productIds['thinkpad-x1-carbon-gen-13'],
          adminId: adminResult._id,
          actionType: 'RESTOCK',
          quantityChange: 10,
          reason: 'Initial inventory load'
        },
        {
          productId: productIds['yoga-slim-7x-snapdragon'],
          adminId: adminResult._id,
          actionType: 'RESTOCK',
          quantityChange: 15,
          reason: 'Supplier shipment received'
        },
        {
          productId: productIds['loq-15-amd-rtx-5060'],
          adminId: adminResult._id,
          actionType: 'SALE',
          quantityChange: -2,
          reason: 'Order #TXN_001'
        },
        {
          productId: productIds['slim-7i-aura-14-intel'],
          adminId: adminResult._id,
          actionType: 'CORRECTION',
          quantityChange: -1,
          reason: 'Damaged unit removed'
        },
        {
          productId: productIds['loq-15-amd-rtx-5060'],
          adminId: adminResult._id,
          actionType: 'CANCELLED_ORDER',
          quantityChange: 1,
          reason: 'Order cancelled - stock returned'
        }
      ];

      await InventoryLog.insertMany(logEntries);
    }
    console.log('[OK] Inventory logs seeded');

    // --- SUMMARY ---
    console.log('\n========================================');
    console.log('[DONE] Database seeding completed!');
    console.log('========================================\n');
    console.log('Login credentials:');
    console.log(`  Admin:    ${adminUser.email} / ${adminPlain}`);
    console.log(`  Customer: ${customerUser.email} / ${customerPlain}\n`);
    console.log('Seeded data summary:');
    console.log(`  - Products: ${laptops.length}`);
    console.log(`  - Users: 2 (admin + customer)`);
    console.log(`  - Cart: 1 (customer with 2 items)`);
    console.log(`  - Orders: 3 (delivered, processing, cancelled)`);
    console.log(`  - Inventory Logs: 5 entries\n`);
    console.log('Usage:');
    console.log('  --reset  Wipe all collections then seed');
    console.log('  --force  Overwrite existing docs\n');

  } catch (err) {
    console.error('[ERROR] Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedDatabase();