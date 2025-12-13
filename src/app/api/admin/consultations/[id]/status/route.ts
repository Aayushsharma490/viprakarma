import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { consultations, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendConsultationApprovedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid consultation ID'
            }, { status: 400 });
        }

        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({
                success: false,
                error: 'Status is required'
            }, { status: 400 });
        }

        // Get consultation details
        const consultation = await db
            .select()
            .from(consultations)
            .where(eq(consultations.id, id))
            .limit(1);

        if (!consultation || consultation.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'Consultation not found'
            }, { status: 404 });
        }

        // Update consultation status
        const updated = await db
            .update(consultations)
            .set({
                requestStatus: status,
                updatedAt: new Date().toISOString()
            })
            .where(eq(consultations.id, id))
            .returning();

        // If approved, enable chat and send email to user
        if (status === 'approved') {
            const consultationData = consultation[0];

            // Enable chat for user
            await db
                .update(users)
                .set({
                    canChatWithAstrologer: true,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(users.id, consultationData.userId));

            // Get user details for email
            const userData = await db
                .select()
                .from(users)
                .where(eq(users.id, consultationData.userId))
                .limit(1);

            if (userData.length > 0) {
                // Send approval email to user
                await sendConsultationApprovedEmail(
                    userData[0].email,
                    userData[0].name,
                    consultationData.mode || 'chat'
                ).catch(err => console.error('Failed to send approval email:', err));
            }
        }

        return NextResponse.json({
            success: true,
            consultation: updated[0]
        });

    } catch (error) {
        console.error('Update consultation status error:', error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error'
        }, { status: 500 });
    }
}
