import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, message, url, subscription } = body;

    // If subscription and VAPID keys exist, web-push can send directly
    const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    if (subscription && vapidPublic && vapidPrivate) {
      const webpush = await import('web-push');
      webpush.setVapidDetails(
        'mailto:support@pitchtime.app',
        vapidPublic,
        vapidPrivate
      );

      const payload = JSON.stringify({
        title: title || 'Pitch Time Match Alert',
        body: message || 'Kickoff starting soon!',
        url: url || '/',
      });

      await webpush.sendNotification(subscription, payload);
      return NextResponse.json({ success: true, mode: 'web-push' });
    }

    // Fallback acknowledgment for client dispatch
    return NextResponse.json({
      success: true,
      mode: 'acknowledged',
      title: title || 'Pitch Time Match Alert',
      body: message || 'Kickoff is starting soon!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch' },
      { status: 500 }
    );
  }
}
