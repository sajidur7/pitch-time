'use client';

export type PermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function checkNotificationSupport(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
}

export function getNotificationPermission(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<PermissionState> {
  if (!checkNotificationSupport()) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
    }
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

export async function sendTestNotification(
  title: string = 'Pitch Time Kickoff Alert',
  body: string = 'Arsenal vs Chelsea begins in 10 minutes at Emirates Stadium!'
): Promise<{ success: boolean; message: string }> {
  if (!checkNotificationSupport()) {
    return {
      success: false,
      message: 'Browser notifications are not supported in this environment.',
    };
  }

  let permission: string = Notification.permission;
  if (permission === 'default') {
    permission = await requestNotificationPermission();
  }

  if (permission !== 'granted') {
    return {
      success: false,
      message: 'Notification permission was denied. Please allow notifications in your browser settings.',
    };
  }

  try {
    // Attempt via Service Worker first
    if ('serviceWorker' in navigator) {
      let reg: ServiceWorkerRegistration | null | undefined = await navigator.serviceWorker.getRegistration();
      if (!reg) {
        reg = await registerServiceWorker();
      }
      if (reg) {
        await reg.showNotification(title, {
          body,
          icon: '/icon.png',
          badge: '/badge.png',
          tag: 'pitch-time-test',
          data: { url: '/' },
        });
        return {
          success: true,
          message: 'Test notification triggered via Service Worker!',
        };
      }
    }

    // Direct Notification fallback
    new Notification(title, {
      body,
      icon: '/icon.png',
      badge: '/badge.png',
    });

    return {
      success: true,
      message: 'Notification displayed successfully!',
    };
  } catch (error: any) {
    console.error('Error sending test notification:', error);
    return {
      success: false,
      message: error?.message || 'Failed to dispatch notification.',
    };
  }
}
