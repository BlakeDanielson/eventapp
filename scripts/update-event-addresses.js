const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateEventAddresses() {
  console.log('🗺️ Updating event addresses with real, geocodable locations...');

  const addressUpdates = [
    {
      title: "TechCrunch Disrupt 2025",
      newLocation: "Moscone Center, 747 Howard St, San Francisco, CA 94103"
    },
    {
      title: "Acme Corp Annual Strategy Summit", 
      newLocation: "The Ritz-Carlton Half Moon Bay, 1 Miramontes Point Rd, Half Moon Bay, CA 94019"
    },
    {
      title: "Downtown Photography Meetup",
      newLocation: "Central Park, 830 5th Ave, New York, NY 10065"
    },
    {
      title: "Hope Foundation Charity Gala",
      newLocation: "Hilton San Francisco Downtown, 750 Kearny St, San Francisco, CA 94108"
    },
    {
      title: "Advanced React Hooks Workshop",
      newLocation: "TechHub, 3411 Hillview Ave, Palo Alto, CA 94304"
    },
    {
      title: "Startup Pitch Night",
      newLocation: "Microsoft Technology Center, 1065 La Avenida, Mountain View, CA 94043"
    }
  ];

  try {
    for (const update of addressUpdates) {
      const result = await prisma.event.updateMany({
        where: {
          title: update.title
        },
        data: {
          location: update.newLocation
        }
      });

      if (result.count > 0) {
        console.log(`✅ Updated "${update.title}" location to: ${update.newLocation}`);
      } else {
        console.log(`⚠️ Event "${update.title}" not found in database`);
      }
    }

    // Also update any events with obviously fake addresses
    const fakeAddressPatterns = [
      'Innovation Drive',
      'Startup Way', 
      '123 Main Street',
      '456 Oak Avenue',
      '789 Innovation'
    ];

    for (const pattern of fakeAddressPatterns) {
      const events = await prisma.event.findMany({
        where: {
          location: {
            contains: pattern
          }
        }
      });

      if (events.length > 0) {
        console.log(`\n⚠️ Found ${events.length} events with potentially fake addresses containing "${pattern}":`);
        events.forEach(event => {
          console.log(`   - "${event.title}": ${event.location}`);
        });
      }
    }

    console.log('\n✨ Address updates completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Add your Google Maps API key to .env file');
    console.log('2. Enable Maps JavaScript API, Places API, and Geocoding API in Google Cloud Console');
    console.log('3. Restart your dev server: npm run dev');
    console.log('4. Test the maps on event pages');

  } catch (error) {
    console.error('❌ Error updating addresses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateEventAddresses(); 