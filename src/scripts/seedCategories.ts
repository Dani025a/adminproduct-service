import { PrismaClient } from '@prisma/client';
import { connectRabbitMQ, getChannel } from '../rabbitmq/connection';
import { categoryPublisher } from '../rabbitmq/categoryPublisher';
const prisma = new PrismaClient();

const categories = [
    {
      id: 1,
      mainCategory: 'Gaming Consoles & Accessories',
      subCategories: [
        { 
          id: 101, name: 'Consoles', 
          subSubCategories: [
            { id: 1001, name: 'PlayStation' },
            { id: 1002, name: 'Xbox' },
            { id: 1003, name: 'Nintendo Switch' },
            { id: 1004, name: 'Steam Deck' }
          ] 
        },
        { 
          id: 102, name: 'Controllers', 
          subSubCategories: [
            { id: 1005, name: 'Wired Controllers' },
            { id: 1006, name: 'Wireless Controllers' },
            { id: 1007, name: 'Pro Controllers' }
          ]
        },
        { 
          id: 103, name: 'Gaming Headsets', 
          subSubCategories: [
            { id: 1008, name: 'Wired Headsets' },
            { id: 1009, name: 'Wireless Headsets' },
            { id: 1010, name: 'Surround Sound Headsets' }
          ]
        },
        { 
          id: 104, name: 'Charging Accessories', 
          subSubCategories: [
            { id: 1011, name: 'Charging Docks' },
            { id: 1012, name: 'USB Chargers' },
            { id: 1013, name: 'Power Banks' }
          ]
        },
        { 
          id: 105, name: 'Console Storage', 
          subSubCategories: [
            { id: 1014, name: 'External SSDs' },
            { id: 1015, name: 'External HDDs' },
            { id: 1016, name: 'Memory Cards' }
          ]
        },
        { 
          id: 106, name: 'Console Skins & Cases', 
          subSubCategories: [
            { id: 1017, name: 'PlayStation Skins' },
            { id: 1018, name: 'Xbox Skins' },
            { id: 1019, name: 'Nintendo Switch Skins' }
          ]
        },
      ],
    },
    {
      id: 2,
      mainCategory: 'PC Gaming & Components',
      subCategories: [
        { 
          id: 201, name: 'Gaming PCs', 
          subSubCategories: [
            { id: 2001, name: 'Prebuilt Gaming PCs' },
            { id: 2002, name: 'Gaming Laptops' },
            { id: 2003, name: 'Custom Builds' }
          ]
        },
        { 
          id: 202, name: 'PC Components', 
          subSubCategories: [
            { id: 2004, name: 'GPUs' },
            { id: 2005, name: 'CPUs' },
            { id: 2006, name: 'RAM' },
            { id: 2007, name: 'Motherboards' },
            { id: 2008, name: 'Power Supplies' }
          ]
        },
        { 
          id: 203, name: 'Gaming Peripherals', 
          subSubCategories: [
            { id: 2009, name: 'Gaming Keyboards' },
            { id: 2010, name: 'Gaming Mice' },
            { id: 2011, name: 'Gaming Monitors' },
            { id: 2012, name: 'Mouse Pads' }
          ]
        },
        { 
          id: 204, name: 'Cooling Systems', 
          subSubCategories: [
            { id: 2013, name: 'Liquid Cooling' },
            { id: 2014, name: 'Air Cooling' },
            { id: 2015, name: 'Thermal Paste' }
          ]
        },
        { 
          id: 205, name: 'PC Storage', 
          subSubCategories: [
            { id: 2016, name: 'SSDs' },
            { id: 2017, name: 'NVMe Drives' },
            { id: 2018, name: 'HDDs' }
          ]
        },
        { 
          id: 206, name: 'Streaming Gear', 
          subSubCategories: [
            { id: 2019, name: 'Capture Cards' },
            { id: 2020, name: 'Streaming Mics' },
            { id: 2021, name: 'Webcams' }
          ]
        },
      ],
    },
    {
      id: 3,
      mainCategory: 'Mobile Devices',
      subCategories: [
        { 
          id: 301, name: 'Smartphones', 
          subSubCategories: [
            { id: 3001, name: 'iPhones' },
            { id: 3002, name: 'Android Phones' },
            { id: 3003, name: 'Gaming Phones' }
          ]
        },
        { 
          id: 302, name: 'Tablets', 
          subSubCategories: [
            { id: 3004, name: 'iPads' },
            { id: 3005, name: 'Android Tablets' },
            { id: 3006, name: 'E-Readers' }
          ]
        },
        { 
          id: 303, name: 'Mobile Accessories', 
          subSubCategories: [
            { id: 3007, name: 'Cases' },
            { id: 3008, name: 'Screen Protectors' },
            { id: 3009, name: 'Chargers' }
          ]
        },
        { 
          id: 304, name: 'Audio Devices', 
          subSubCategories: [
            { id: 3010, name: 'Wireless Earbuds' },
            { id: 3011, name: 'Wired Earphones' },
            { id: 3012, name: 'Bluetooth Speakers' }
          ]
        },
        { 
          id: 305, name: 'Wearable Mobile Tech', 
          subSubCategories: [
            { id: 3013, name: 'Smartwatches' },
            { id: 3014, name: 'Fitness Bands' },
            { id: 3015, name: 'Wireless Charging Pads' }
          ]
        },
      ],
    },
    {
      id: 4,
      mainCategory: 'Home Entertainment & Audio',
      subCategories: [
        { 
          id: 401, name: 'TVs', 
          subSubCategories: [
            { id: 4001, name: 'OLED TVs' },
            { id: 4002, name: 'LED TVs' },
            { id: 4003, name: 'QLED TVs' },
            { id: 4004, name: '8K TVs' }
          ]
        },
        { 
          id: 402, name: 'Audio Systems', 
          subSubCategories: [
            { id: 4005, name: 'Soundbars' },
            { id: 4006, name: 'Home Theater Systems' },
            { id: 4007, name: 'Subwoofers' }
          ]
        },
        { 
          id: 403, name: 'Streaming Devices', 
          subSubCategories: [
            { id: 4008, name: 'Chromecast' },
            { id: 4009, name: 'Roku' },
            { id: 4010, name: 'Fire Stick' }
          ]
        },
        { 
          id: 404, name: 'Gaming Projectors', 
          subSubCategories: [
            { id: 4011, name: '1080p Projectors' },
            { id: 4012, name: '4K Projectors' }
          ]
        },
        { 
          id: 405, name: 'Media Players', 
          subSubCategories: [
            { id: 4013, name: 'Blu-Ray Players' },
            { id: 4014, name: 'Portable DVD Players' }
          ]
        },
      ],
    },
  ];
  
async function seed() {
    try {
      console.log('Connecting to RabbitMQ...');
      await connectRabbitMQ();
  
      console.log('Deleting old data...');
      await prisma.subSubCategory.deleteMany();
      await prisma.subCategory.deleteMany();
      await prisma.mainCategory.deleteMany();
  
      console.log('Seeding new data...');
      for (const category of categories) {
        const mainCategory = await prisma.mainCategory.create({
          data: { id: category.id, name: category.mainCategory },
        });
        await categoryPublisher('category', { action: 'create', type: 'mainCategory', data: mainCategory });
  
        for (const sub of category.subCategories) {
          const subCategory = await prisma.subCategory.create({
            data: { id: sub.id, name: sub.name, mainCategoryId: mainCategory.id },
          });
          await categoryPublisher('category', { action: 'create', type: 'subCategory', data: subCategory });
  
          for (const subSub of sub.subSubCategories) {
            const subSubCategory = await prisma.subSubCategory.create({
              data: { id: subSub.id, name: subSub.name, subCategoryId: subCategory.id },
            });
            await categoryPublisher('category', { action: 'create', type: 'subSubCategory', data: subSubCategory });
          }
        }
      }
  
      console.log('Seeding completed with RabbitMQ publishing!');
    } catch (error) {
      console.error('Error during seeding:', error);
    } finally {
      const channel = getChannel();
      if (channel) await channel.close();
      await prisma.$disconnect();
    }
  }
  
  seed();