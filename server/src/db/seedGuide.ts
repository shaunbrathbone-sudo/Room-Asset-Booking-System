import { getPool } from '../config/database';

export const seedGuide = async () => {
    const pool = await getPool();

    const guideData = {
        title: 'WELCOME TO 17 FRIAR LANE',
        subtitle: 'Your guide to settling into the new Cloudfy & WCL headquarters',
        sections: [
            {
                id: 'arrival',
                title: 'Arrival & Commuting',
                icon: 'Navigation',
                items: [
                    { label: 'Address', value: '17 Friar Lane, Leicester LE1 5RB' },
                    { label: 'Access', value: 'Your existing key fobs have been imported into the new system and will work automatically upon arrival.' },
                    { label: 'Hours', value: 'The office is open during standard working hours.' },
                    { label: 'Parking', value: 'The nearest car park is St Nicholas Circle (Euro Car Parks). We also highly recommend the Highcross \'John Lewis\' Car Park.' },
                    { label: 'Cyclists', value: 'A shower is available in one of the first-floor toilets for those cycling to work.' }
                ]
            },
            {
                id: 'first_floor',
                title: 'First Floor Workspaces',
                icon: 'Layers',
                items: [
                    { label: 'Senior Leadership Team Room', value: 'Located at the top of the stairs (Rob, Simon, and Shaun).' },
                    { label: 'Cloudfy Project Team Room', value: 'Dedicated workspace for Cloudfy Project managers & delivery.' },
                    { label: 'WCL & Cloudfy Support Room', value: 'With 3 Support work desks. Don\'t forget to book.' },
                    { label: 'Flexible Working Room', value: '5 Flexible work desks. Don\'t forget to book.' },
                    { label: 'Private Kitchenette', value: 'Exclusive to our teams with tea, coffee, snacks & fresh fruit.' },
                    { label: 'Toilets & Shower', value: 'Available on this floor for all team members.' }
                ]
            },
            {
                id: 'ground_floor',
                title: 'Ground Floor Layout',
                icon: 'Building',
                items: [
                    { label: 'Cloudfy Development Team Room', value: 'Located in their own dedicated room at the bottom of the stairs.' },
                    { label: 'Executive Boardroom', value: '10-person executive boardroom with AV conferencing.' },
                    { label: 'General Kitchen', value: 'Available for use, but please note that this is a general-building kitchen open to all occupants.' },
                    { label: 'Toilets', value: 'Available on this floor.' }
                ]
            },
            {
                id: 'amenities_it',
                title: 'Amenities & IT Systems',
                icon: 'Wifi',
                items: [
                    { label: 'Snacks & Drinks', value: 'All tea, coffee, snacks, and fresh fruit are located in our private first-floor kitchenette.' },
                    { label: 'Water', value: 'Filtered water is available on the first floor. A second dispenser is being installed on the ground floor shortly.' },
                    { label: 'Wi-Fi', value: 'Connect business equipment to the \'Cloudfy / WCL\' network. Please use the Guest network for personal mobiles and visitors.' },
                    { label: 'Printing', value: 'Our Xerox printer and scanner are located in the Senior Leadership Team office.' },
                    { label: 'IT Support', value: 'For any technical issues (e.g. monitors, docking stations), please log a call through the normal Williams helpdesk.' }
                ]
            },
            {
                id: 'booking_rules',
                title: 'Desk & Room Booking Guidelines',
                icon: 'Calendar',
                items: [
                    { label: 'Hot Desking', value: 'We have 3 hot desks in the Support office and 5 in the Flexible Working Room. To book these, use SpaceBook 3D or your calendar appointment and ensure \'Show as\' is set to \'Free\' (not busy).' },
                    { label: 'Meeting Rooms', value: 'The \'Asgard\' meeting room (first floor, top of the stairs) can be booked directly in SpaceBook 3D. The main boardroom is approval-gated for executive sessions.' }
                ]
            },
            {
                id: 'local_area',
                title: 'Local Area & Safety',
                icon: 'Coffee',
                items: [
                    { label: '☕ Coffee', value: 'St Martin\'s Coffee Shop is highly recommended for a great morning brew.' },
                    { label: '🥪 Lunch', value: 'Kai in St Martin\'s Square offers excellent food and brunch options.' },
                    { label: '🍻 After Work', value: 'The Globe on Silver Street is a historic local pub, perfect for unwinding.' },
                    { label: '🧹 Clean Desk', value: 'Keep your desk paper-free and tidy at the end of the day.' },
                    { label: '🩹 First Aid', value: 'Existing dedicated first aiders remain the same in this building.' },
                    { label: '🚨 Emergency', value: 'Evacuation procedures and assembly points are located at Friar Lane exit.' }
                ]
            }
        ],
        footerBanner: 'Welcome to the team! Make yourself at home from Day One.'
    };

    const guideJson = JSON.stringify(guideData);

    await pool.request()
        .input('officeId', '55555555-5555-5555-5555-555555555555')
        .input('title', guideData.title)
        .input('subtitle', guideData.subtitle)
        .input('contentJson', guideJson)
        .query(`
            INSERT OR REPLACE INTO office_guides (office_id, title, subtitle, content_json, updated_at)
            VALUES (@officeId, @title, @subtitle, @contentJson, datetime('now'))
        `);

    console.log('[GUIDE] 17 Friar Lane Guide seeded successfully.');
};

if (require.main === module) {
    seedGuide().then(() => process.exit(0));
}