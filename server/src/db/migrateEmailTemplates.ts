import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../config/database';

export async function migrateEmailTemplates() {
    console.log('[MIGRATION] Setting up email_templates and email_logs tables...');
    const pool = await getPool();

    // 1. Create email_templates table
    await pool.request().query(`
        CREATE TABLE IF NOT EXISTS email_templates (
            id TEXT PRIMARY KEY,
            code TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            subject TEXT NOT NULL,
            preheader TEXT,
            body_html TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'booking',
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Create email_logs table
    await pool.request().query(`
        CREATE TABLE IF NOT EXISTS email_logs (
            id TEXT PRIMARY KEY,
            template_code TEXT NOT NULL,
            recipient_email TEXT NOT NULL,
            subject TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'sent',
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            error_message TEXT
        );
    `);

    // 3. Seed Default System Templates
    const defaultTemplates = [
        {
            id: uuidv4(),
            code: 'booking_confirmation',
            name: 'Booking Confirmation Receipt',
            category: 'booking',
            subject: 'Confirmation: Your booking for {{resourceName}} at {{officeName}} is confirmed!',
            preheader: 'Your workspace booking confirmation and details.',
            body_html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
    <div style="background: #2563eb; padding: 32px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Cloudfy Workspaces</h1>
        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Booking Confirmation Receipt</p>
    </div>
    <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Hi <strong>{{userName}}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">Great news! Your booking has been successfully confirmed. Here are the details of your upcoming reservation:</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 40%;"><strong>Location:</strong></td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{officeName}}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Floor / Zone:</strong></td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{floorName}}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Resource / Desk:</strong></td>
                    <td style="padding: 6px 0; color: #2563eb; font-weight: 700;">{{resourceName}}</td>
                </tr>
                <tr>
                    <td style="padding: 6px 0; color: #64748b;"><strong>Date & Time:</strong></td>
                    <td style="padding: 6px 0; color: #0f172a; font-weight: 600;">{{bookingTime}}</td>
                </tr>
            </table>
        </div>

        <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; border-radius: 8px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #1e40af;"><strong>Wi-Fi Network:</strong> {{wifiDetails}}</p>
        </div>

        <div style="text-align: center; margin: 32px 0 16px;">
            <a href="{{commuteLink}}" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; display: inline-block;">View Commute & Office Guide</a>
        </div>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
        Cloudfy Workspaces • Powered by Intelligent Workplace Management
    </div>
</div>`
        },
        {
            id: uuidv4(),
            code: 'reminder_24h',
            name: '24-Hour Pre-Arrival Reminder',
            category: 'reminder',
            subject: 'Reminder: Your visit to {{officeName}} tomorrow for {{resourceName}}',
            preheader: 'Your pre-arrival details, commute guide, and check-in instructions.',
            body_html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
    <div style="background: #f59e0b; padding: 32px 24px; text-align: center; color: #0f172a;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Upcoming Visit Reminder</h1>
        <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">24 Hours Before Reservation</p>
    </div>
    <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #1e293b; margin-top: 0;">Hi <strong>{{userName}}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">This is a friendly reminder that you are booked for tomorrow at <strong>{{officeName}}</strong>.</p>
        
        <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 6px; font-size: 14px; color: #92400e; font-weight: bold;">Reservation Summary:</p>
            <p style="margin: 4px 0; font-size: 13px; color: #78350f;"><strong>Resource:</strong> {{resourceName}} ({{floorName}})</p>
            <p style="margin: 4px 0; font-size: 13px; color: #78350f;"><strong>Schedule:</strong> {{bookingTime}}</p>
        </div>

        <h3 style="font-size: 14px; color: #0f172a; margin: 20px 0 8px;">Commute & Parking Advice:</h3>
        <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 0 0 16px;">Please check our multi-modal commute guide for the best train stations, parking locations, and local transit options before departing.</p>

        <div style="text-align: center; margin: 24px 0;">
            <a href="{{commuteLink}}" style="background: #f59e0b; color: #0f172a; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-weight: 800; font-size: 14px; display: inline-block;">Check Transit & Parking Options</a>
        </div>
    </div>
    <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
        Cloudfy Workspaces • Powered by Intelligent Workplace Management
    </div>
</div>`
        },
        {
            id: uuidv4(),
            code: 'meeting_alert_15m',
            name: '15-Minute Meeting Room Alert',
            category: 'alert',
            subject: 'Starting in 15 Minutes: Your meeting in {{resourceName}} at {{officeName}}',
            preheader: 'Your room is ready. Check-in and AV setup details.',
            body_html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
    <div style="background: #10b981; padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Meeting Starting in 15 Minutes</h1>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">{{resourceName}} • {{floorName}}</p>
    </div>
    <div style="padding: 28px 24px;">
        <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Hi <strong>{{userName}}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">Your reserved meeting room <strong>{{resourceName}}</strong> is prepared and ready for your session starting at <strong>{{bookingTime}}</strong>.</p>
        
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 18px; margin: 20px 0;">
            <p style="margin: 0 0 6px; font-size: 13px; color: #065f46; font-weight: bold;">Quick Room Access & AV:</p>
            <p style="margin: 3px 0; font-size: 13px; color: #047857;">• Screen Share: Connect via Wireless Display or HDMI table port</p>
            <p style="margin: 3px 0; font-size: 13px; color: #047857;">• Video Bar: Poly 4K Studio active on console</p>
            <p style="margin: 3px 0; font-size: 13px; color: #047857;">• Refreshments: Hot Chai & Filter Coffee on this floor</p>
        </div>

        <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 24px;">Please ensure the room is left tidy at the conclusion of your meeting.</p>
    </div>
</div>`
        },
        {
            id: uuidv4(),
            code: 'booking_cancellation',
            name: 'Booking Cancellation Receipt',
            category: 'cancellation',
            subject: 'Cancelled: Reservation for {{resourceName}} at {{officeName}}',
            preheader: 'Confirmation of your cancelled reservation.',
            body_html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
    <div style="background: #ef4444; padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 800;">Reservation Cancelled</h1>
        <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Booking Reference Released</p>
    </div>
    <div style="padding: 28px 24px;">
        <p style="font-size: 15px; color: #1e293b; margin-top: 0;">Hi <strong>{{userName}}</strong>,</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6;">Your reservation for <strong>{{resourceName}}</strong> on <strong>{{bookingTime}}</strong> has been cancelled. The workspace has been made available for other team members.</p>
        <div style="text-align: center; margin: 24px 0 8px;">
            <a href="{{commuteLink}}" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">Make a New Reservation</a>
        </div>
    </div>
</div>`
        }
    ];

    for (const t of defaultTemplates) {
        await pool.request().query(`
            INSERT INTO email_templates (id, code, name, subject, preheader, body_html, category, is_active)
            VALUES (
                '${t.id}',
                '${t.code}',
                '${t.name}',
                '${t.subject.replace(/'/g, "''")}',
                '${t.preheader?.replace(/'/g, "''") || ''}',
                '${t.body_html.replace(/'/g, "''")}',
                '${t.category}',
                1
            )
            ON CONFLICT(code) DO UPDATE SET
                name = excluded.name,
                subject = excluded.subject,
                preheader = excluded.preheader,
                body_html = excluded.body_html;
        `);
    }

    console.log('[SUCCESS] Email templates migrated and seeded successfully!');
}

migrateEmailTemplates().then(() => process.exit(0)).catch((err) => {
    console.error('[ERROR] Failed to migrate email templates:', err);
    process.exit(1);
});