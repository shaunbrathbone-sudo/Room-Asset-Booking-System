'use client';

import { useState } from 'react';
import { 
    Train, Bus, Car, Bike, Footprints, 
    SquareParking, Compass, Copy, Check, MapPin, 
    AlertCircle, Sparkles, Navigation 
} from 'lucide-react';

interface OfficeCommuteGuideProps {
    officeSlug: string;
    officeName: string;
    address: string;
}

interface CommuteMode {
    id: string;
    label: string;
    icon: any;
    title: string;
    subtitle: string;
    items: {
        heading: string;
        detail: string;
        tag?: string;
        tagColor?: string;
        copyableText?: string;
    }[];
    proTip?: string;
}

export const OfficeCommuteGuide = ({ officeSlug, officeName, address }: OfficeCommuteGuideProps) => {
    const [activeTab, setActiveTab] = useState('train');
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const isLondon = officeSlug.includes('london');
    const isIndia = officeSlug.includes('india') || officeSlug.includes('noida');

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const getCommuteModes = (): CommuteMode[] => {
        if (isIndia) {
            return [
                {
                    id: 'metro',
                    label: 'Metro & Subway',
                    icon: Train,
                    title: 'Delhi Metro (Blue Line)',
                    subtitle: 'Fast, air-conditioned rapid transit directly to Sector 62',
                    items: [
                        {
                            heading: 'Noida Electronic City Metro Station (Blue Line)',
                            detail: 'Exit via Gate No. 2. Just 3 minutes by e-rickshaw or a 10-minute walk (800m) along the pedestrian avenue.',
                            tag: '800m • 3 min auto',
                            tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                            copyableText: 'Noida Electronic City Metro Station Gate 2'
                        },
                        {
                            heading: 'Airport & Central Delhi Connections',
                            detail: 'Direct Blue Line train to Rajiv Chowk (Connaught Place) in 35 mins. Connect to Airport Express Line at New Delhi.',
                            tag: 'Direct Route',
                            tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }
                    ],
                    proTip: 'E-rickshaws and auto-rickshaws are lined up directly outside Metro Gate 2 for ₹10-20 shared fare.'
                },
                {
                    id: 'train',
                    label: 'Mainline Rail',
                    icon: Compass,
                    title: 'National & Intercity Railway',
                    subtitle: 'Key intercity terminals serving Delhi NCR',
                    items: [
                        {
                            heading: 'Anand Vihar Terminal (ANVT)',
                            detail: '6.5 km away (15-20 min cab ride). Best railhead for Northern & Eastern Superfast / Vande Bharat trains.',
                            tag: '15 min drive',
                            tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        },
                        {
                            heading: 'New Delhi Railway Station (NDLS)',
                            detail: '18 km away. Easily accessible via direct Blue Line Metro from Noida Electronic City.',
                            tag: '35 min metro',
                            tagColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }
                    ],
                    proTip: 'For morning intercity trains from Anand Vihar, book an app cab (Uber / Ola) 30 mins in advance.'
                },
                {
                    id: 'bus',
                    label: 'Bus & Transit',
                    icon: Bus,
                    title: 'DTC & Intercity City Buses',
                    subtitle: 'Frequent bus corridors across NCR and Uttar Pradesh',
                    items: [
                        {
                            heading: 'Sector 62 Chhijarsi Bus Stop',
                            detail: 'Located 400m from Corenthum Tower C. Serviced by DTC routes connecting Noida, Ghaziabad, and East Delhi.',
                            tag: '5 min walk',
                            tagColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                        }
                    ],
                    proTip: 'AC electric buses run every 10 minutes along the Sector 62 expressway corridor.'
                },
                {
                    id: 'car',
                    label: 'Driving & Expressways',
                    icon: Car,
                    title: 'Highway & Expressway Access',
                    subtitle: 'Seamless multi-lane arterial connections',
                    items: [
                        {
                            heading: 'Delhi-Meerut Expressway (NH-9)',
                            detail: 'Take the Sector 62 exit from NH-9. Direct 14-lane high-speed corridor from Central Delhi / Akshardham in 20 mins.',
                            tag: 'NH-9 Exit',
                            tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        },
                        {
                            heading: 'Noida-Greater Noida Expressway',
                            detail: 'Connect via Sector 62 road junction. Smooth access from Jewar International Airport corridor and Pari Chowk.',
                            tag: 'Signal-free',
                            tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }
                    ],
                    proTip: 'Use Fastag lanes at expressway exits to avoid peak morning queue delays.'
                },
                {
                    id: 'parking',
                    label: 'Parking & EV',
                    icon: SquareParking,
                    title: 'On-Site Tower Parking & Charging',
                    subtitle: 'Secure underground multi-level basement bays',
                    items: [
                        {
                            heading: 'The Iconic Corenthum Tower C Basements (B1 & B2)',
                            detail: 'Dedicated employee and visitor car parking. Swipe RFID pass or collect visitor slip at gate.',
                            tag: 'On-Site • 24/7 CCTV',
                            tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                            copyableText: 'The Iconic Corenthum Tower C Sector 62 Noida'
                        },
                        {
                            heading: 'EV Charging Points (Level B1)',
                            detail: 'Fast CCS2 and AC Type 2 electric vehicle chargers available on Basement Level 1.',
                            tag: 'EV Fast Chargers',
                            tagColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300'
                        }
                    ],
                    proTip: 'Visitors can register their license plate with 3rd-floor reception for complimentary all-day parking validation.'
                },
                {
                    id: 'bike',
                    label: 'Cycling & Two-Wheelers',
                    icon: Bike,
                    title: 'Two-Wheeler & Bicycle Facilities',
                    subtitle: 'Covered parking & last-mile electric bikes',
                    items: [
                        {
                            heading: 'Covered Motorbike & Cycle Bays',
                            detail: 'Extensive secure covered parking for two-wheelers in Tower C ground courtyard.',
                            tag: 'Covered Bays',
                            tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        },
                        {
                            heading: 'Yulu EV Bike Share at Metro Station',
                            detail: 'Yulu app-based low-speed electric bikes available at Noida Electronic City Metro exit for ₹1.5/min.',
                            tag: 'App Rental',
                            tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }
                    ],
                    proTip: 'Helmet storage lockers are available inside the 3rd-floor office entry lobby.'
                },
                {
                    id: 'walk',
                    label: 'Walking & Access',
                    icon: Footprints,
                    title: 'Pedestrian & Step-Free Route',
                    subtitle: 'Paved walkways and institutional corridor',
                    items: [
                        {
                            heading: 'Sector 62 Institutional Walkway',
                            detail: 'Wide, tree-lined, paved footpath connects Metro Gate 2 directly to The Iconic Corenthum plaza.',
                            tag: 'Step-Free Access',
                            tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }
                    ],
                    proTip: 'Tower C lobby has ramped entry and high-speed elevators directly to the 3rd floor.'
                }
            ];
        }

        if (isLondon) {
            return [
                {
                    id: 'train',
                    label: 'Underground & Rail',
                    icon: Train,
                    title: 'Farringdon & Elizabeth Line',
                    subtitle: 'London’s best connected transit super-hub',
                    items: [
                        {
                            heading: 'Farringdon Station (Elizabeth, Circle, H&C, Metropolitan)',
                            detail: 'Only a 4-minute walk (0.2 miles). Direct Elizabeth Line trains to Heathrow Airport (32m), Canary Wharf (8m), and Paddington.',
                            tag: '4 min walk • 0.2 mi',
                            tagColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
                            copyableText: 'Farringdon Station, Cowcross St, London EC1M 6BY'
                        },
                        {
                            heading: 'Thameslink National Rail',
                            detail: 'Direct mainline Thameslink trains to Gatwick Airport (40m), Luton Airport Parkway (35m), Brighton, and Cambridge.',
                            tag: 'Thameslink Direct',
                            tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        },
                        {
                            heading: 'Chancery Lane (Central Line) & Barbican',
                            detail: 'Chancery Lane is an 8-minute walk west; Barbican station is 6 minutes east.',
                            tag: '6-8 min walk',
                            tagColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }
                    ],
                    proTip: 'Use the Farringdon Elizabeth Line Turnmill Street exit for the shortest walk to the office.'
                },
                {
                    id: 'bus',
                    label: 'Bus Routes',
                    icon: Bus,
                    title: 'Central London Bus Corridors',
                    subtitle: 'High frequency stops on Clerkenwell Road',
                    items: [
                        {
                            heading: 'Clerkenwell Road / Farringdon Road (Stops C & D)',
                            detail: 'Routes 55 (Oxford Circus / Hackney), 63 (Kings Cross / Peckham), 153 (Moorgate / Finsbury Park), 243 (Waterloo / Wood Green).',
                            tag: '2 min walk',
                            tagColor: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        },
                        {
                            heading: 'Night Buses',
                            detail: '24-hour services on routes N55, N63, and N243 stopping directly on Clerkenwell Road.',
                            tag: '24/7 Service',
                            tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }
                    ],
                    proTip: 'Tap in with contactless payment or Oyster card for instant hopper fare savings.'
                },
                {
                    id: 'car',
                    label: 'Driving & ULEZ',
                    icon: Car,
                    title: 'Road Access & Congestion Charge',
                    subtitle: 'Central London driving regulations',
                    items: [
                        {
                            heading: 'Congestion Charge & ULEZ Zone',
                            detail: 'The office sits within the London Congestion Charge Zone (£15/day) and Ultra Low Emission Zone (ULEZ). Public transit is strongly recommended.',
                            tag: 'ULEZ & CC Zone',
                            tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        }
                    ],
                    proTip: 'Electric vehicles must be registered with TfL for Cleaner Vehicle Discount exemptions.'
                },
                {
                    id: 'parking',
                    label: 'Car Parks',
                    icon: SquareParking,
                    title: 'Nearby Secure Multi-Storey Car Parks',
                    subtitle: 'Pre-bookable secure parking nearby',
                    items: [
                        {
                            heading: 'NCP Saffron Hill Car Park (EC1N 8XA)',
                            detail: '4-minute walk (0.2 miles). 24-hour multi-storey secure parking with pre-booking available online.',
                            tag: '4 min walk',
                            tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                            copyableText: 'NCP Saffron Hill, 14B St Cross St, London EC1N 8XA'
                        },
                        {
                            heading: 'Smithfield Car Park (EC1A 9DY)',
                            detail: '6-minute walk (0.3 miles). 24/7 underground parking with EV charging bays.',
                            tag: '6 min walk • EV',
                            tagColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
                            copyableText: 'Smithfield Car Park, West Smithfield, London EC1A 9DY'
                        }
                    ],
                    proTip: 'Smithfield car park offers lower evening and overnight rates after 18:00.'
                },
                {
                    id: 'bike',
                    label: 'Cycling & Hire',
                    icon: Bike,
                    title: 'Cycle Superhighways & Docking',
                    subtitle: 'Cycleway C6 directly connects Farringdon',
                    items: [
                        {
                            heading: 'On-Site Basement Bike Storage',
                            detail: 'Secure internal basement bike racks, repair stand, pump, and drying lockers.',
                            tag: 'On-Site Racks',
                            tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        },
                        {
                            heading: 'Santander Cycles Docking Stations',
                            detail: 'Docks located immediately on Clerkenwell Road and Farringdon Road (over 40 docking points).',
                            tag: 'Santander & Lime',
                            tagColor: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                        }
                    ],
                    proTip: 'Showers and changing rooms are available on the lower ground floor.'
                },
                {
                    id: 'walk',
                    label: 'Walking Routes',
                    icon: Footprints,
                    title: 'Pedestrian Corridors',
                    subtitle: 'Historic Clerkenwell & Farringdon streets',
                    items: [
                        {
                            heading: 'From Farringdon Elizabeth Line',
                            detail: 'Exit onto Turnmill Street, head north across Clerkenwell Road into historic Clerkenwell Green.',
                            tag: '4 min walk',
                            tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        }
                    ],
                    proTip: 'Entire route from Farringdon Station has dropped curbs and step-free pavement access.'
                }
            ];
        }

        // Leicester Hub (Default)
        return [
            {
                id: 'train',
                label: 'Train & Rail',
                icon: Train,
                title: 'Leicester Mainline Railway Station',
                subtitle: 'Direct high-speed East Midlands Railway services',
                items: [
                    {
                        heading: 'Leicester Railway Station (LE1 6RJ)',
                        detail: '12-minute walk (0.6 miles) or 4 minutes by taxi from the station rank. Direct trains to London St Pancras (65m), Birmingham New Street (48m), Sheffield, and Nottingham.',
                        tag: '12 min walk • 0.6 mi',
                        tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
                        copyableText: 'Leicester Railway Station, London Rd, Leicester LE1 6RJ'
                    }
                ],
                proTip: 'Walking from the station via Granby Street and Market Street offers a scenic pedestrian route through the heart of the city.'
            },
            {
                id: 'bus',
                label: 'Bus & Coach',
                icon: Bus,
                title: 'City Centre Bus Connections',
                subtitle: 'Close to major bus hubs and local stops',
                items: [
                    {
                        heading: 'Haymarket & St Margaret’s Bus Stations',
                        detail: '8-minute walk from both main bus terminals. Serviced by Arriva, First Bus, and National Express coach routes.',
                        tag: '8 min walk',
                        tagColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    },
                    {
                        heading: 'St Nicholas Circle & Southgates Stops',
                        detail: 'Local stops located 2 minutes away on Southgates and St Nicholas Circle (Routes 47, 48, 84, 85, Hospital Hopper).',
                        tag: '2 min walk',
                        tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }
                ],
                proTip: 'The Leicester Hospital Hopper and Park & Ride buses stop directly at St Nicholas Circle.'
            },
            {
                id: 'car',
                label: 'Driving & Road Links',
                icon: Car,
                title: 'Motorway & Ring Road Directions',
                subtitle: 'Fast link from M1 Junction 21',
                items: [
                    {
                        heading: 'From M1 / M69 (Junction 21)',
                        detail: 'Take A5460 (Narborough Road) directly into Leicester City Centre (approx 10 minutes). Follow signs for Southgates / St Nicholas Circle.',
                        tag: '10 min from M1',
                        tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    }
                ],
                proTip: 'Friar Lane is accessible via Southgates and Oxford Street for drop-offs.'
            },
            {
                id: 'parking',
                label: 'Car Parks & EV',
                icon: SquareParking,
                title: 'City Centre Parking & Charging',
                subtitle: 'Convenient multi-storey car parks within 2-6 minutes',
                items: [
                    {
                        heading: 'St Nicholas Circle NCP (LE1 4LF)',
                        detail: '2-minute walk (150m). 350 spaces, 24/7 access, CCTV monitored.',
                        tag: '2 min walk • 350 Spaces',
                        tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
                        copyableText: 'St Nicholas Circle NCP, St Nicholas Cir, Leicester LE1 4LF'
                    },
                    {
                        heading: 'Highcross John Lewis Rooftop (LE1 4QJ)',
                        detail: '6-minute walk. Multi-storey with dedicated 50kW EV fast chargers and disabled bays.',
                        tag: '6 min walk • EV Chargers',
                        tagColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300',
                        copyableText: 'Highcross John Lewis Car Park, Vaughan Way, Leicester LE1 4QJ'
                    },
                    {
                        heading: 'Newarke Street Multi-Storey (LE1 5SN)',
                        detail: '4-minute walk. Council-operated with economical daily tariff rates.',
                        tag: '4 min walk',
                        tagColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
                        copyableText: 'Newarke Street Car Park, Newarke St, Leicester LE1 5SN'
                    }
                ],
                proTip: 'We recommend St Nicholas Circle for nearest proximity, or Highcross Rooftop for electric vehicle charging.'
            },
            {
                id: 'bike',
                label: 'Cycling & Showers',
                icon: Bike,
                title: 'Bicycle Storage & Facilities',
                subtitle: 'Internal bike parking and shower facilities',
                items: [
                    {
                        heading: 'Secure Internal Bike Racks',
                        detail: 'Protected internal cycle storage in the 17 Friar Lane courtyard area.',
                        tag: 'On-Site Storage',
                        tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    },
                    {
                        heading: 'First Floor Shower',
                        detail: 'A private shower is available in one of the first-floor restrooms for team members cycling or running to work.',
                        tag: '1st Floor Shower',
                        tagColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                    },
                    {
                        heading: 'Santander / SmartBike Scheme',
                        detail: 'Docking stations located at Town Hall Square and St Nicholas Circle.',
                        tag: 'City Bike Share',
                        tagColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    }
                ],
                proTip: 'The Great Central Way and River Soar cycle paths connect directly to Southgates.'
            },
            {
                id: 'walk',
                label: 'Walking & Access',
                icon: Footprints,
                title: 'Pedestrian Routes & Accessibility',
                subtitle: 'Historic cathedral quarter pedestrian links',
                items: [
                    {
                        heading: 'From Town Hall Square & Cathedral',
                        detail: 'Walk past Leicester Cathedral and Guildhall along Friar Lane. Completely paved, pedestrian-friendly streets.',
                        tag: 'Pedestrianised',
                        tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    }
                ],
                proTip: 'Level step-free access is available through the main front entrance on Friar Lane.'
            }
        ];
    };

    const modes = getCommuteModes();
    const activeMode = modes.find((m) => m.id === activeTab) || modes[0];

    return (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-cyan-400">
                        <Navigation className="w-6 h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400 tracking-wider">
                            Getting Here • Travel & Transit
                        </span>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                            Commute Guidance & Local Transport
                        </h2>
                    </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="truncate max-w-sm">{address}</span>
                </div>
            </div>

            {/* Travel Mode Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {modes.map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = activeTab === mode.id;

                    return (
                        <button
                            key={mode.id}
                            type="button"
                            onClick={() => setActiveTab(mode.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                                isSelected
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{mode.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Active Mode Card */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-3">
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                            {activeMode.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {activeMode.subtitle}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeMode.items.map((item, idx) => (
                        <div 
                            key={idx}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-3"
                        >
                            <div className="space-y-1.5">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                        {item.heading}
                                    </h4>
                                    {item.tag && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${item.tagColor || 'bg-blue-50 text-blue-700'}`}>
                                            {item.tag}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {item.detail}
                                </p>
                            </div>

                            {item.copyableText && (
                                <button
                                    type="button"
                                    onClick={() => copyToClipboard(item.copyableText!, idx)}
                                    className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline w-full"
                                >
                                    <span>Copy Sat-Nav / Maps Address</span>
                                    {copiedIndex === idx ? (
                                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                            <Check className="w-3.5 h-3.5" /> Copied!
                                        </span>
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {activeMode.proTip && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                        <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <strong>Commute Pro-Tip:</strong> {activeMode.proTip}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OfficeCommuteGuide;