const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTestEvents() {
  console.log('🌱 Seeding test events with full Q&A system...');

  // Get current user ID from environment or use a test user ID
  const userId = process.env.CLERK_USER_ID || 'user_2qjwHYC1DPfJZN7BqQXV2ZZAG5O'; // Your actual Clerk user ID

  // Sample event data showcasing all functionality including Q&A
  const testEvents = [
    {
      // 1. Premium Tech Conference (Paid, Physical, Multiple Tickets, Q&A Enabled)
      title: "TechCrunch Disrupt 2025",
      date: new Date('2025-02-15T09:00:00Z'),
      time: "9:00 AM",
      location: "Moscone Center, 747 Howard St, San Francisco, CA 94103",
      bio: "The premier technology conference bringing together the most innovative startups, investors, and thought leaders. Join us for three days of groundbreaking presentations, networking, and product launches.",
      agenda: `
9:00 AM - Registration & Coffee
10:00 AM - Opening Keynote: The Future of AI
11:30 AM - Startup Battlefield (Round 1)
1:00 PM - Networking Lunch
2:30 PM - Panel: Web3 and the Metaverse
4:00 PM - Investor Spotlight
5:30 PM - Evening Reception
      `.trim(),
      qa: "Q&A sessions will be held after each presentation. Submit questions via the event app or raise your hand during designated times.",
      qaEnabled: true, // Enable interactive Q&A system
      imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      userId,
      status: "public",
      hasTickets: true,
      requiresTickets: true,
      tickets: [
        {
          name: "Early Bird General",
          description: "Access to all sessions, networking events, and lunch. Limited time offer!",
          price: 299.00,
          maxQuantity: 500,
          soldQuantity: 342,
          saleEndDate: new Date('2025-01-15T23:59:59Z'),
        },
        {
          name: "General Admission",
          description: "Access to all sessions, networking events, and lunch.",
          price: 399.00,
          maxQuantity: 1000,
          soldQuantity: 127,
        },
        {
          name: "VIP Pass",
          description: "All-access pass including exclusive VIP lounge, premium seating, and private investor mixer.",
          price: 799.00,
          maxQuantity: 100,
          soldQuantity: 23,
        }
      ],
      referrals: [
        { name: "TechBlog Partnership" },
        { name: "University Outreach" },
        { name: "Previous Attendee Referrals" }
      ],
      questions: [
        {
          content: "Will there be live streaming for remote attendees who couldn't make it?",
          askerName: "Sarah Chen",
          askerEmail: "sarah.chen@techstartup.com",
          upvotes: 15,
          isApproved: true,
          answers: [
            {
              content: "Yes! We'll have full live streaming for all main stage presentations. VIP pass holders get access to exclusive breakout sessions as well.",
              answererName: "TechCrunch Team",
              answererEmail: "events@techcrunch.com",
              isOfficial: true
            }
          ]
        },
        {
          content: "What's the parking situation at Moscone Center?",
          askerName: "Mike Rodriguez",
          askerEmail: "mike.r@devtools.io",
          upvotes: 8,
          isApproved: true,
          answers: [
            {
              content: "Moscone Center has a parking garage with early bird rates. We also recommend using public transit - it's right next to the Powell Street station.",
              answererName: "Event Coordinator",
              answererEmail: "coordinator@techcrunch.com",
              isOfficial: true
            }
          ]
        },
        {
          content: "Are there any networking events specifically for first-time attendees?",
          askerName: "Jennifer Wu",
          askerEmail: "jen.wu@newgrad.com",
          upvotes: 12,
          isApproved: true,
        }
      ]
    },

    {
      // 2. Free Virtual Workshop (Q&A Enabled)
      title: "Remote Work Mastery Workshop",
      date: new Date('2025-01-20T14:00:00Z'),
      time: "2:00 PM",
      location: "Zoom Virtual Meeting",
      bio: "Learn the essential skills and tools for thriving in a remote work environment. Perfect for both new remote workers and seasoned professionals looking to optimize their workflow.",
      agenda: `
2:00 PM - Welcome & Introductions
2:15 PM - Setting up Your Home Office
3:00 PM - Communication Tools & Best Practices
3:45 PM - Break
4:00 PM - Time Management & Productivity
4:45 PM - Q&A and Wrap-up
5:00 PM - Optional Networking Breakout Rooms
      `.trim(),
      qa: "Questions will be answered throughout the session. Use the chat feature or raise your virtual hand.",
      qaEnabled: true,
      imageUrl: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800",
      userId,
      status: "public",
      hasTickets: false,
      requiresTickets: false,
      referrals: [
        { name: "LinkedIn Professional Groups" },
        { name: "Remote Work Communities" }
      ],
      questions: [
        {
          content: "What are the best tools for time tracking when working remotely?",
          askerName: "Alex Johnson",
          askerEmail: "alex.j@freelancer.com",
          upvotes: 7,
          isApproved: true,
          answers: [
            {
              content: "Great question! I recommend tools like Toggl, RescueTime, or even simple techniques like the Pomodoro Technique. We'll cover this in detail during the time management segment.",
              answererName: "Workshop Instructor",
              answererEmail: "instructor@remotework.edu",
              isOfficial: true
            }
          ]
        },
        {
          content: "How do you maintain work-life balance when your home is your office?",
          askerName: "Maria Santos",
          askerEmail: "maria.santos@consultant.net",
          upvotes: 23,
          isApproved: true,
        }
      ]
    },

    {
      // 3. Private Corporate Event (Q&A Disabled for confidentiality)
      title: "Acme Corp Annual Strategy Summit",
      date: new Date('2025-03-10T09:00:00Z'),
      time: "9:00 AM",
      location: "The Ritz-Carlton Half Moon Bay, 1 Miramontes Point Rd, Half Moon Bay, CA 94019",
      bio: "Our exclusive annual leadership summit bringing together department heads and key stakeholders to align on company strategy and goals for the upcoming year.",
      agenda: `
9:00 AM - Executive Breakfast
10:00 AM - CEO State of the Company
11:00 AM - Q1 Performance Review
12:30 PM - Strategic Planning Lunch
2:00 PM - Department Breakout Sessions
4:00 PM - Cross-Functional Collaboration Workshop
6:00 PM - Team Dinner & Awards Ceremony
      `.trim(),
      qa: "All questions should be directed to your department head or submitted anonymously via the event portal.",
      qaEnabled: false, // Disabled for confidential corporate event
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
      userId,
      status: "private",
      hasTickets: true,
      requiresTickets: true,
      tickets: [
        {
          name: "Executive Package",
          description: "Includes accommodation, all meals, and exclusive executive materials.",
          price: 1200.00,
          maxQuantity: 50,
          soldQuantity: 31,
        }
      ],
      invitees: [
        { email: "john.doe@acmecorp.com" },
        { email: "jane.smith@acmecorp.com" },
        { email: "mike.johnson@acmecorp.com" },
        { email: "sarah.wilson@acmecorp.com" }
      ]
    },

    {
      // 4. Free Community Meetup (Q&A Enabled)
      title: "Downtown Photography Meetup",
      date: new Date('2025-01-25T18:00:00Z'),
      time: "6:00 PM",
      location: "Central Park, 830 5th Ave, New York, NY 10065",
      bio: "Monthly meetup for photography enthusiasts of all skill levels. Bring your camera and join us for photo walks, tips sharing, and casual networking.",
      agenda: `
6:00 PM - Arrival & Mingling
6:30 PM - Photo Challenge Presentations
7:00 PM - Group Photo Walk
8:00 PM - Coffee & Critique Session
9:00 PM - Wrap-up & Next Month Planning
      `.trim(),
      qa: "Feel free to ask questions anytime! We're a friendly and welcoming community.",
      qaEnabled: true,
      imageUrl: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800",
      userId,
      status: "public",
      hasTickets: false,
      requiresTickets: false,
      referrals: [
        { name: "Instagram Photography Groups" },
        { name: "Camera Club Partnerships" }
      ],
      questions: [
        {
          content: "What's the best camera settings for golden hour photography in the park?",
          askerName: "David Kim",
          askerEmail: "david.kim@photographer.com",
          upvotes: 5,
          isApproved: true,
          answers: [
            {
              content: "For golden hour, try a lower ISO (100-400), wider aperture (f/2.8-f/5.6), and slightly underexpose to maintain those warm tones. We'll practice this during our walk!",
              answererName: "Photo Meetup Organizer",
              answererEmail: "organizer@photomeetup.com",
              isOfficial: true
            }
          ]
        },
        {
          content: "Is this meetup suitable for complete beginners with just smartphone cameras?",
          askerName: "Lisa Park",
          askerEmail: "lisa.park@email.com",
          upvotes: 9,
          isApproved: true,
          answers: [
            {
              content: "Absolutely! We welcome all skill levels and equipment. Smartphone photography is a great starting point and we have several members who specialize in mobile photography.",
              answererName: "Community Manager",
              answererEmail: "community@photomeetup.com",
              isOfficial: true
            }
          ]
        }
      ]
    },

    {
      // 5. Virtual Webinar Series (Q&A Enabled)
      title: "Digital Marketing Mastery Series: Episode 3",
      date: new Date('2025-02-01T12:00:00Z'),
      time: "12:00 PM",
      location: "Microsoft Teams Live Event",
      bio: "Part 3 of our comprehensive digital marketing series focusing on social media advertising and ROI optimization. Perfect for small business owners and marketing professionals.",
      agenda: `
12:00 PM - Series Recap & Today's Objectives
12:15 PM - Social Media Advertising Fundamentals
1:00 PM - Platform-Specific Strategies (Facebook, Instagram, LinkedIn)
1:45 PM - Measuring ROI and Analytics
2:15 PM - Live Q&A Session
2:45 PM - Next Episode Preview & Resources
3:00 PM - End
      `.trim(),
      qa: "Submit questions in advance or during the live Q&A segment. All questions will be answered!",
      qaEnabled: true,
      imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
      userId,
      status: "public",
      hasTickets: true,
      requiresTickets: true,
      tickets: [
        {
          name: "Free Registration",
          description: "Includes live attendance, recording access, and bonus resources.",
          price: 0.00,
          maxQuantity: 1000,
          soldQuantity: 456,
        }
      ],
      questions: [
        {
          content: "What's the recommended budget for a small business just starting with Facebook ads?",
          askerName: "Rachel Green",
          askerEmail: "rachel@smallbiz.com",
          upvotes: 18,
          isApproved: true,
          answers: [
            {
              content: "I recommend starting with $5-10 per day for testing, then scaling up based on performance. We'll cover budget optimization strategies in today's session!",
              answererName: "Marketing Expert",
              answererEmail: "expert@digitalmarketing.com",
              isOfficial: true
            }
          ]
        },
        {
          content: "How do you track conversions across multiple platforms effectively?",
          askerName: "Tom Chen",
          askerEmail: "tom.chen@agency.co",
          upvotes: 11,
          isApproved: true,
        }
      ]
    },

    {
      // 6. Charity Fundraiser (Q&A Enabled)
      title: "Hope Foundation Charity Gala",
      date: new Date('2025-04-05T19:00:00Z'),
      time: "7:00 PM",
      location: "Hilton San Francisco Downtown, 750 Kearny St, San Francisco, CA 94108",
      bio: "An elegant evening of dining, entertainment, and giving back to support local families in need. Join us for our annual charity gala featuring live music, auctions, and inspiring stories of impact.",
      agenda: `
7:00 PM - Cocktail Reception & Silent Auction
8:00 PM - Welcome & Opening Remarks
8:30 PM - Dinner Service
9:30 PM - Impact Stories & Testimonials
10:00 PM - Live Auction
10:30 PM - Entertainment & Dancing
12:00 AM - Event Conclusion
      `.trim(),
      qa: "Questions about our programs and impact are welcome throughout the evening.",
      qaEnabled: true,
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
      userId,
      status: "public",
      hasTickets: true,
      requiresTickets: true,
      tickets: [
        {
          name: "Individual Seat",
          description: "Elegant dinner, entertainment, and auction participation. All proceeds benefit local families.",
          price: 150.00,
          maxQuantity: 200,
          soldQuantity: 89,
        },
        {
          name: "Patron Table",
          description: "Reserved table for 8, premium seating, special recognition, and exclusive meet & greet.",
          price: 1500.00,
          maxQuantity: 20,
          soldQuantity: 7,
        }
      ],
      referrals: [
        { name: "Community Partners" },
        { name: "Corporate Sponsors" }
      ],
      questions: [
        {
          content: "What percentage of donations goes directly to families versus administrative costs?",
          askerName: "Emily Foster",
          askerEmail: "emily.foster@donor.org",
          upvotes: 14,
          isApproved: true,
          answers: [
            {
              content: "85% of all donations go directly to our programs and families. Only 15% covers administrative costs, well below the recommended 25% threshold for nonprofits.",
              answererName: "Hope Foundation Director",
              answererEmail: "director@hopefoundation.org",
              isOfficial: true
            }
          ]
        }
      ]
    },

    {
      // 7. Sold Out Workshop (Q&A Enabled but limited due to exclusivity)
      title: "Advanced React Hooks Workshop",
      date: new Date('2025-01-30T10:00:00Z'),
      time: "10:00 AM",
      location: "Google Developer Space, 188 King St, San Francisco, CA 94107",
      bio: "An intensive hands-on workshop diving deep into advanced React Hooks patterns and custom hook development. Limited to 12 participants for personalized instruction.",
      agenda: `
10:00 AM - Setup & Introductions
10:30 AM - Advanced useState & useEffect Patterns
12:00 PM - Lunch Break
1:00 PM - Custom Hooks Development
2:30 PM - Performance Optimization with useMemo & useCallback
4:00 PM - Real-world Hook Patterns
5:00 PM - Wrap-up
      `.trim(),
      qa: "Instructor will be available for questions throughout the workshop. Bring your laptop with Node.js installed!",
      qaEnabled: true,
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
      userId,
      status: "public",
      hasTickets: true,
      requiresTickets: true,
      tickets: [
        {
          name: "Workshop Seat",
          description: "Includes hands-on instruction, code samples, and lunch. Limited to 12 participants for optimal learning.",
          price: 249.00,
          maxQuantity: 12,
          soldQuantity: 12, // Sold out!
          isActive: false, // No longer available
        }
      ],
      questions: [
        {
          content: "Will code samples be provided, or do we need to bring our own projects?",
          askerName: "Kevin Zhang",
          askerEmail: "kevin.zhang@developer.io",
          upvotes: 6,
          isApproved: true,
          answers: [
            {
              content: "We'll provide complete code samples and starter projects. You're also welcome to bring your own code for discussion during the session!",
              answererName: "React Workshop Instructor",
              answererEmail: "instructor@reactworkshop.dev",
              isOfficial: true
            }
          ]
        }
      ]
    },

    {
      // 8. Hybrid Event (Q&A Enabled for both audiences)
      title: "Startup Pitch Night & Networking",
      date: new Date('2025-02-08T18:30:00Z'),
      time: "6:30 PM",
      location: "Microsoft Technology Center, 1065 La Avenida, Mountain View, CA 94043",
      bio: "Monthly pitch night where local startups present to investors and the community. Attend in-person for networking or join virtually to watch the presentations.",
      agenda: `
6:30 PM - Registration & Networking (In-Person Only)
7:00 PM - Welcome & Format Overview
7:15 PM - Startup Pitches (6 companies, 8 min each)
8:15 PM - Audience Q&A & Voting
8:30 PM - Investor Panel Discussion
9:00 PM - Winner Announcement
9:15 PM - Continued Networking (In-Person) / Event End (Virtual)
10:00 PM - Event Conclusion
      `.trim(),
      qa: "Virtual attendees can submit questions via chat. In-person attendees can ask questions during designated Q&A periods.",
      qaEnabled: true,
      imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
      userId,
      status: "public",
      hasTickets: true,
      requiresTickets: true,
      tickets: [
        {
          name: "In-Person Attendance",
          description: "Full experience including networking, drinks, and in-person Q&A with founders and investors.",
          price: 25.00,
          maxQuantity: 150,
          soldQuantity: 78,
        },
        {
          name: "Virtual Access",
          description: "Livestream access to all presentations and panel discussion. Includes recording access.",
          price: 10.00,
          maxQuantity: 500,
          soldQuantity: 234,
        }
      ],
      referrals: [
        { name: "Entrepreneur Communities" },
        { name: "Investor Groups" },
        { name: "University Partnerships" }
      ],
      questions: [
        {
          content: "Will there be opportunities for virtual attendees to network with each other?",
          askerName: "Amanda Liu",
          askerEmail: "amanda.liu@remotefounder.com",
          upvotes: 9,
          isApproved: true,
          answers: [
            {
              content: "Yes! We'll have virtual breakout rooms after the event for networking. Virtual attendees will also get access to our Slack workspace for ongoing connections.",
              answererName: "Event Organizer",
              answererEmail: "organizer@pitchnight.com",
              isOfficial: true
            }
          ]
        },
        {
          content: "What criteria do you use to select the startups that get to pitch?",
          askerName: "Roberto Silva",
          askerEmail: "roberto@investor.fund",
          upvotes: 13,
          isApproved: true,
        }
      ]
    }
  ];

  // Clear existing test events and Q&A data
  console.log('🧹 Clearing existing events and Q&A data...');
  await prisma.questionUpvote.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.invitee.deleteMany();
  await prisma.event.deleteMany();

  // Create events with all related data including Q&A
  for (const eventData of testEvents) {
    console.log(`📅 Creating event: ${eventData.title}`);
    
    const { tickets = [], referrals = [], invitees = [], questions = [], ...eventInfo } = eventData;
    
    // Create the event
    const event = await prisma.event.create({
      data: eventInfo
    });

    // Create tickets if any
    if (tickets.length > 0) {
      for (const ticketData of tickets) {
        const ticket = await prisma.ticket.create({
          data: {
            ...ticketData,
            eventId: event.id
          }
        });

        // Create some mock purchases for sold tickets
        if (ticketData.soldQuantity > 0) {
          const purchasesToCreate = Math.min(ticketData.soldQuantity, 10); // Limit to 10 for brevity
          
          for (let i = 0; i < purchasesToCreate; i++) {
            await prisma.purchase.create({
              data: {
                eventId: event.id,
                ticketId: ticket.id,
                buyerName: `Test Buyer ${i + 1}`,
                buyerEmail: `buyer${i + 1}@example.com`,
                quantity: 1,
                totalAmount: ticketData.price,
                status: "completed",
                paymentMethod: "mock",
                transactionId: `mock_${Date.now()}_${i}`,
                paymentData: {
                  mockPayment: true,
                  cardLast4: "4242",
                  cardBrand: "visa"
                }
              }
            });
          }
        }
      }
    }

    // Create referrals if any
    if (referrals.length > 0) {
      for (const referralData of referrals) {
        await prisma.referral.create({
          data: {
            ...referralData,
            eventId: event.id
          }
        });
      }
    }

    // Create invitees if any (for private events)
    if (invitees.length > 0) {
      for (const inviteeData of invitees) {
        await prisma.invitee.create({
          data: {
            ...inviteeData,
            eventId: event.id,
            inviteToken: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        });
      }
    }

    // Create Q&A data if any
    if (questions.length > 0) {
      for (const questionData of questions) {
        const { answers = [], ...questionInfo } = questionData;
        
        // Create the question
        const question = await prisma.question.create({
          data: {
            ...questionInfo,
            eventId: event.id
          }
        });

        // Create answers if any
        if (answers.length > 0) {
          for (const answerData of answers) {
            await prisma.answer.create({
              data: {
                ...answerData,
                questionId: question.id
              }
            });
          }
        }

        // Create some random upvotes
        if (questionData.upvotes > 0) {
          const upvotesToCreate = Math.min(questionData.upvotes, 8); // Limit for brevity
          for (let i = 0; i < upvotesToCreate; i++) {
            await prisma.questionUpvote.create({
              data: {
                questionId: question.id,
                voterEmail: `voter${i + 1}@example.com`
              }
            });
          }
        }
      }
    }

    // Create some registrations
    const registrationCount = Math.floor(Math.random() * 20) + 5; // 5-25 registrations
    for (let i = 0; i < registrationCount; i++) {
      await prisma.registration.create({
        data: {
          name: `Attendee ${i + 1}`,
          email: `attendee${i + 1}@example.com`,
          eventId: event.id,
          status: "registered"
        }
      });
    }
  }

  console.log('✅ Test events with Q&A system created successfully!');
  console.log('\n📊 Summary:');
  console.log(`- ${testEvents.length} events created`);
  console.log('- Various event types: paid/free, physical/virtual/hybrid, public/private');
  console.log('- Multiple ticket types and pricing strategies');
  console.log('- Referral systems and invite tracking');
  console.log('- Mock purchases and registrations');
  console.log('- Interactive Q&A with questions, answers, and upvotes');
  console.log('\n🎯 Features tested:');
  console.log('✓ Public vs Private events');
  console.log('✓ Physical vs Virtual locations');
  console.log('✓ Free vs Paid ticketing');
  console.log('✓ Multiple ticket tiers');
  console.log('✓ Sold out scenarios');
  console.log('✓ Referral tracking');
  console.log('✓ Private event invites');
  console.log('✓ Registration management');
  console.log('✓ Purchase tracking');
  console.log('✓ Q&A system with questions, answers, and upvotes');
  console.log('✓ Q&A enabled/disabled per event');
  console.log('✓ Official vs community answers');
  console.log('✓ Question moderation and approval');
}

async function main() {
  try {
    await seedTestEvents();
  } catch (error) {
    console.error('❌ Error seeding test events:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

module.exports = { seedTestEvents }; 