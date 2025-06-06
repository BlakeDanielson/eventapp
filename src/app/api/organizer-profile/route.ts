import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { organizerProfileFormSchema } from '@/types/forms';

const prisma = new PrismaClient();

// GET /api/organizer-profile - Get current user's organizer profile
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const profile = await prisma.organizerProfile.findUnique({
      where: { userId },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching organizer profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizer profile' },
      { status: 500 }
    );
  }
}

// POST /api/organizer-profile - Create or update organizer profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the request body
    const validationResult = organizerProfileFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Transform form data to database format
    const profileData = {
      userId,
      displayName: data.displayName,
      organizationType: data.organizationType,
      bio: data.bio || null,
      email: data.email || null,
      phone: data.phone || null,
      website: data.website || null,
      location: data.location || null,
      linkedinUrl: data.linkedinUrl || null,
      twitterUrl: data.twitterUrl || null,
      facebookUrl: data.facebookUrl || null,
      instagramUrl: data.instagramUrl || null,
      brandColor: data.brandColor || null,
      defaultLocation: data.defaultLocation || null,
      defaultLocationType: data.defaultLocationType || null,
      defaultStreetAddress: data.defaultStreetAddress || null,
      defaultCity: data.defaultCity || null,
      defaultState: data.defaultState || null,
      defaultZipCode: data.defaultZipCode || null,
      defaultCountry: data.defaultCountry || null,
      defaultVirtualLink: data.defaultVirtualLink || null,
      defaultVirtualPlatform: data.defaultVirtualPlatform || null,
      defaultAgenda: data.defaultAgenda || null,
      eventDisclaimer: data.eventDisclaimer || null,
      showContactInfo: data.showContactInfo,
      showSocialLinks: data.showSocialLinks,
      // Note: File uploads will be handled separately
    };

    // Use upsert to create or update the profile
    const profile = await prisma.organizerProfile.upsert({
      where: { userId },
      update: profileData,
      create: profileData,
    });

    return NextResponse.json({ 
      success: true, 
      profile,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error creating/updating organizer profile:', error);
    return NextResponse.json(
      { error: 'Failed to save organizer profile' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizer-profile - Delete organizer profile
export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if profile exists
    const existingProfile = await prisma.organizerProfile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Organizer profile not found' },
        { status: 404 }
      );
    }

    // Delete the profile
    await prisma.organizerProfile.delete({
      where: { userId },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Profile deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting organizer profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete organizer profile' },
      { status: 500 }
    );
  }
} 