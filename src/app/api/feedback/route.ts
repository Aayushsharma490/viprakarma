import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { serviceName, rating, feedback, timestamp } = await req.json();

        // Validate input
        if (!serviceName || !rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Invalid feedback data' },
                { status: 400 }
            );
        }

        // For now, log to console (in production, save to database)
        console.log('Feedback received:', {
            serviceName,
            rating,
            feedback,
            timestamp,
            receivedAt: new Date().toISOString()
        });

        // TODO: Save to database when schema is ready
        // await db.insert(feedbacks).values({
        //     serviceName,
        //     rating,
        //     feedback,
        //     timestamp: new Date(timestamp)
        // });

        return NextResponse.json({
            success: true,
            message: 'Feedback submitted successfully'
        });
    } catch (error) {
        console.error('Feedback submission error:', error);
        return NextResponse.json(
            { error: 'Failed to save feedback' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Feedback API endpoint',
        methods: ['POST']
    });
}
