const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Product = require('../models/product.model');
const User = require('../models/user.model');
require('dotenv').config();

// Sample laptop data based on your folders
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

// Admin user
const adminUser = {
  firstname: "Admin",
  lastname: "User",
  email: "admin@nozama.com",
  role: "admin"
};

// Test customer user
const customerUser = {
  firstname: "Test",
  lastname: "Customer",
  email: "customer@nozama.com",
  role: "customer"
};

// Seed function
async function seedDatabase() {
  try {
    console.log(' Starting database seed...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' Connected to MongoDB');

    // Clear existing data
    console.log('  Clearing existing data...');
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log(' Existing data cleared');

    // Insert products
    console.log(' Inserting products...');
    await Product.insertMany(laptops);
    console.log(` Inserted ${laptops.length} products`);

    // Hash passwords
    console.log(' Creating users...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const customerPasswordHash = await bcrypt.hash('customer123', 10);

    // Create users with passwordHash
    await User.create([
      {
        ...adminUser,
        passwordHash: adminPasswordHash,
      },
      {
        ...customerUser,
        passwordHash: customerPasswordHash,
      },
    ]);

    console.log(' Created admin and customer users');

    console.log('\n Database seeding completed successfully!\n');
    console.log(' Login credentials:');
    console.log('   Admin: admin@nozama.com / admin123');
    console.log('   Customer: customer@nozama.com / customer123\n');

    process.exit(0);
  } catch (error) {
    console.error(' Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();