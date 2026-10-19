import type { TClientStatus } from "../types/sellerObserver/clients.types";

const visitedSvgIcon = `<svg width="100px" height="100px" viewBox="-12 -12 48.00 48.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-12" y="-12" width="48.00" height="48.00" rx="3.84" fill="#ddb12f" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M7.2998 5H22L20 12H8.37675M21 16H9L7 3H4M4 8H2M5 11H2M6 14H2M10 20C10 20.5523 9.55228 21 9 21C8.44772 21 8 20.5523 8 20C8 19.4477 8.44772 19 9 19C9.55228 19 10 19.4477 10 20ZM21 20C21 20.5523 20.5523 21 20 21C19.4477 21 19 20.5523 19 20C19 19.4477 19.4477 19 20 19C20.5523 19 21 19.4477 21 20Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`;
const visitedIcon = `data:image/svg+xml;base64,${btoa(visitedSvgIcon)}`;

const noVisitedSvgIcon = `<svg width="100px" height="100px" viewBox="-12 -12 48.00 48.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"><path transform="translate(-12, -12), scale(3)" fill="#d72d2d" d="M9.166.33a2.25 2.25 0 00-2.332 0l-5.25 3.182A2.25 2.25 0 00.5 5.436v5.128a2.25 2.25 0 001.084 1.924l5.25 3.182a2.25 2.25 0 002.332 0l5.25-3.182a2.25 2.25 0 001.084-1.924V5.436a2.25 2.25 0 00-1.084-1.924L9.166.33z" strokewidth="0"></path></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 5L19 12H7.37671M20 16H8L6 3H3M11 3L13.5 5.5M13.5 5.5L16 8M13.5 5.5L16 3M13.5 5.5L11 8M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`
const noVisitedIcon = `data:image/svg+xml;base64,${btoa(noVisitedSvgIcon)}`;

const sellSvgIcon = `<svg width="100px" height="100px" viewBox="-12 -12 48.00 48.00" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"><rect x="-12" y="-12" width="48.00" height="48.00" rx="24" fill="#10a745" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 5L19 12H7.37671M20 16H8L6 3H3M11 6L13 8L17 4M9 20C9 20.5523 8.55228 21 8 21C7.44772 21 7 20.5523 7 20C7 19.4477 7.44772 19 8 19C8.55228 19 9 19.4477 9 20ZM20 20C20 20.5523 19.5523 21 19 21C18.4477 21 18 20.5523 18 20C18 19.4477 18.4477 19 19 19C19.5523 19 20 19.4477 20 20Z" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>`
const sellIcon = `data:image/svg+xml;base64,${btoa(sellSvgIcon)}`;

const timeStampSvgIcon = '<svg viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"><path transform="translate(-2.4, -2.4), scale(1.7999999999999998)" fill="#ffffff" d="M9.166.33a2.25 2.25 0 00-2.332 0l-5.25 3.182A2.25 2.25 0 00.5 5.436v5.128a2.25 2.25 0 001.084 1.924l5.25 3.182a2.25 2.25 0 002.332 0l5.25-3.182a2.25 2.25 0 001.084-1.924V5.436a2.25 2.25 0 00-1.084-1.924L9.166.33z" strokewidth="0"></path></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 7V12L13.5 14.5M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>'
export const timeStampIcon = `data:image/svg+xml;base64,${btoa(timeStampSvgIcon)}`;


const stallVisitedSvgIcon = `<svg viewBox="-6.24 -6.24 36.48 36.48" id="meteor-icon-kit__solid-marketplace-stall" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)"><rect x="-6.24" y="-6.24" width="36.48" height="36.48" rx="18.24" fill="#0b7731" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.192"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_525_137)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M1.79279 0.725279C1.91545 0.295978 2.30783 0 2.75431 0H21.2457C21.6922 0 22.0846 0.295977 22.2072 0.725279L23.6358 5.72528C23.8183 6.36409 23.3387 7 22.6743 7H20V14H23C23.5523 14 24 14.4477 24 15C24 15.5523 23.5523 16 23 16H22V23C22 23.5523 21.5523 24 21 24H3C2.44772 24 2 23.5523 2 23V16H1C0.447715 16 0 15.5523 0 15C0 14.4477 0.447715 14 1 14H4V7H1.32574C0.661363 7 0.1817 6.3641 0.364219 5.72528L1.79279 0.725279ZM6 7H18V14H6V7ZM8 18C8 17.4477 7.55228 17 7 17C6.44772 17 6 17.4477 6 18V21C6 21.5523 6.44772 22 7 22C7.55228 22 8 21.5523 8 21V18ZM13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V18ZM17 17C17.5523 17 18 17.4477 18 18V21C18 21.5523 17.5523 22 17 22C16.4477 22 16 21.5523 16 21V18C16 17.4477 16.4477 17 17 17Z" fill="#ffffff"></path> </g> <defs> <clipPath id="clip0_525_137"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> </g></svg>`
export const stallVisitedIcon = `data:image/svg+xml;base64,${btoa(stallVisitedSvgIcon)}`;

const stallNoVisitedSvgIcon = `<svg viewBox="-6.24 -6.24 36.48 36.48" id="meteor-icon-kit__solid-marketplace-stall" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)"><rect x="-6.24" y="-6.24" width="36.48" height="36.48" rx="18.24" fill="#e7c712" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.192"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_525_137)"> <path fill-rule="evenodd" clip-rule="evenodd" d="M1.79279 0.725279C1.91545 0.295978 2.30783 0 2.75431 0H21.2457C21.6922 0 22.0846 0.295977 22.2072 0.725279L23.6358 5.72528C23.8183 6.36409 23.3387 7 22.6743 7H20V14H23C23.5523 14 24 14.4477 24 15C24 15.5523 23.5523 16 23 16H22V23C22 23.5523 21.5523 24 21 24H3C2.44772 24 2 23.5523 2 23V16H1C0.447715 16 0 15.5523 0 15C0 14.4477 0.447715 14 1 14H4V7H1.32574C0.661363 7 0.1817 6.3641 0.364219 5.72528L1.79279 0.725279ZM6 7H18V14H6V7ZM8 18C8 17.4477 7.55228 17 7 17C6.44772 17 6 17.4477 6 18V21C6 21.5523 6.44772 22 7 22C7.55228 22 8 21.5523 8 21V18ZM13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V18ZM17 17C17.5523 17 18 17.4477 18 18V21C18 21.5523 17.5523 22 17 22C16.4477 22 16 21.5523 16 21V18C16 17.4477 16.4477 17 17 17Z" fill="#ffffff"></path> </g> <defs> <clipPath id="clip0_525_137"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> </g></svg>`
export const stallNoVisitedIcon = `data:image/svg+xml;base64,${btoa(stallNoVisitedSvgIcon)}`;

export const getDeliveryClientIcon = (driverColor?: string, isProcessed?: boolean) => {
    const bgColor = isProcessed ? '#0b7731' : '#0284c7';

    const deliveryClientSvg = `
        <svg viewBox="${driverColor ? '-10 -10 44 44' : '-6.24 -6.24 36.5 36.5'}" id="meteor-icon-kit__solid-marketplace-stall" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024">
            <g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)">
                ${driverColor ? `<rect x="-6.24" y="-6.24" width="36.48" height="36.48" rx="18.24" fill="none" stroke="${driverColor}" stroke-width="6"></rect>` : ''}
                <rect x="-6.24" y="-6.24" width="36.48" height="36.48" rx="18.24" fill="${bgColor}" ${driverColor ? 'stroke="#ffffff" stroke-width="1.2"' : 'strokewidth="0"'}></rect>
            </g>
            <g id="SVGRepo_iconCarrier">
                <g clip-path="url(#clip0_525_137_dc)">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.79279 0.725279C1.91545 0.295978 2.30783 0 2.75431 0H21.2457C21.6922 0 22.0846 0.295977 22.2072 0.725279L23.6358 5.72528C23.8183 6.36409 23.3387 7 22.6743 7H20V14H23C23.5523 14 24 14.4477 24 15C24 15.5523 23.5523 16 23 16H22V23C22 23.5523 21.5523 24 21 24H3C2.44772 24 2 23.5523 2 23V16H1C0.447715 16 0 15.5523 0 15C0 14.4477 0.447715 14 1 14H4V7H1.32574C0.661363 7 0.1817 6.3641 0.364219 5.72528L1.79279 0.725279ZM6 7H18V14H6V7ZM8 18C8 17.4477 7.55228 17 7 17C6.44772 17 6 17.4477 6 18V21C6 21.5523 6.44772 22 7 22C7.55228 22 8 21.5523 8 21V18ZM13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V18ZM17 17C17.5523 17 18 17.4477 18 18V21C18 21.5523 17.5523 22 17 22C16.4477 22 16 21.5523 16 21V18C16 17.4477 16.4477 17 17 17Z" fill="#ffffff"></path>
                </g>
                <defs>
                    <clipPath id="clip0_525_137_dc">
                        <rect width="24" height="24" fill="white"></rect>
                    </clipPath>
                </defs>
            </g>
        </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(deliveryClientSvg)}`;
};

export const deliveryClientFixedIcon = getDeliveryClientIcon();


export const getStartPointIcon = (color: string) => {
    const startingPointSvgIcon = `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 4"></path> </g></svg>`

    return `data:image/svg+xml;base64,${btoa(startingPointSvgIcon)}`;
}


export const getClientIcon = (iconType: TClientStatus, time: string, timeOnZone: string, isTimeVisible: boolean = false, sellerColor?: string) => {
    const iconsTypes: Record<TClientStatus, { color: string }> = {
        VISITED: {
            color: '#0b7731',
        },
        NOSALE: {
            color: '#e7c712',
        },
        UNJUSTIFIED: {
            color: '#e7c712',
        },
        NOVISITED: {
            color: '#bf1126', 
        },
        PENDING: {
            color: '#777778', 
        },
        UNKOWN: {
            color: '#777777',
        },
    }

    const clientIcon = isTimeVisible ?
        `
    
        <svg viewBox="-6.24 -31.24 60.96 89" id="meteor-icon-kit__solid-marketplace-stall" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003">
            <g id="SVG_time" stroke-width="0" transform="translate(-0.4,-21)">
                <rect width="50" height="20" x="0" y="-6.24" rx="10" ry="50" fill="#013f47" stroke="#ffffff" stroke-width="0.75"/>
                <text x="25" y="9" text-anchor="middle" stroke="#fff" fill="#fff" font-size="13">${timeOnZone ?? `'"''`}</text>
            </g>
            <g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(12,0), scale(1)">
                <rect x="-6.24" y="-6.24" width="36.48" height="36.48" rx="18.24" fill="${iconsTypes[iconType].color}" strokewidth="0"></rect>
            </g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.192" transform="translate(12,0)"></g>
            <g id="SVGRepo_iconCarrier" transform="translate(12,0)"> 
                <g clip-path="url(#clip0_525_137)"> 
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.79279 0.725279C1.91545 0.295978 2.30783 0 2.75431 0H21.2457C21.6922 
                    0 22.0846 0.295977 22.2072 0.725279L23.6358 5.72528C23.8183 6.36409 23.3387 7 22.6743 7H20V14H23C23.5523 14 24 14.4477 
                    24 15C24 15.5523 23.5523 16 23 16H22V23C22 23.5523 21.5523 24 21 24H3C2.44772 24 2 23.5523 2 23V16H1C0.447715 16 0 15.5523 
                    0 15C0 14.4477 0.447715 14 1 14H4V7H1.32574C0.661363 7 0.1817 6.3641 0.364219 5.72528L1.79279 0.725279ZM6 7H18V14H6V7ZM8 
                    18C8 17.4477 7.55228 17 7 17C6.44772 17 6 17.4477 6 18V21C6 21.5523 6.44772 22 7 22C7.55228 22 8 21.5523 8 21V18ZM13 18C13
                    17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V18ZM17
                    17C17.5523 17 18 17.4477 18 18V21C18 21.5523 17.5523 22 17 22C16.4477 22 16 21.5523 16 21V18C16 17.4477 16.4477 17 17 
                    17Z" fill="#ffffff"></path> 
                </g> 
                <defs> <clipPath id="clip0_525_137"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> 
            </g>
            <g id="SVG_time" stroke-width="0" transform="translate(-0.4,38)">
                <rect width="50" height="20" x="0" y="-6.24" rx="10" ry="50" fill="#013f47" stroke="#ffffff" stroke-width="0.75"/>
                <text x="25" y="9" text-anchor="middle" stroke="#fff" fill="#fff" font-size="13">${time ?? '-:-:-'}</text>
            </g>
        </svg>
    
    `
        :
        `
        <svg viewBox="${sellerColor ? '-10 -10 44 44' : '-6.24 -6.24 36.5 36.5'}" id="meteor-icon-kit__solid-marketplace-stall" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" stroke-width="0.00024000000000000003">
            <g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)">
                ${sellerColor ? `<rect x="-6.24" y="-6.24" width="36.48" height="36.48" rx="18.24" fill="none" stroke="${sellerColor}" stroke-width="6"></rect>` : ''}
                <rect x="-6.24" y="-6.24" width="36.48" height="36.48" rx="18.24" fill="${iconsTypes[iconType].color}" ${sellerColor ? 'stroke="#ffffff" stroke-width="1.2"' : 'strokewidth="0"'}></rect>
            </g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.192" transform="translate(0,0)"></g>
            <g id="SVGRepo_iconCarrier" transform="translate(0,0)"> 
                <g clip-path="url(#clip0_525_137)"> 
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.79279 0.725279C1.91545 0.295978 2.30783 0 2.75431 0H21.2457C21.6922 
                    0 22.0846 0.295977 22.2072 0.725279L23.6358 5.72528C23.8183 6.36409 23.3387 7 22.6743 7H20V14H23C23.5523 14 24 14.4477 
                    24 15C24 15.5523 23.5523 16 23 16H22V23C22 23.5523 21.5523 24 21 24H3C2.44772 24 2 23.5523 2 23V16H1C0.447715 16 0 15.5523 
                    0 15C0 14.4477 0.447715 14 1 14H4V7H1.32574C0.661363 7 0.1817 6.3641 0.364219 5.72528L1.79279 0.725279ZM6 7H18V14H6V7ZM8 
                    18C8 17.4477 7.55228 17 7 17C6.44772 17 6 17.4477 6 18V21C6 21.5523 6.44772 22 7 22C7.55228 22 8 21.5523 8 21V18ZM13 18C13
                    17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18V21C11 21.5523 11.4477 22 12 22C12.5523 22 13 21.5523 13 21V18ZM17
                    17C17.5523 17 18 17.4477 18 18V21C18 21.5523 17.5523 22 17 22C16.4477 22 16 21.5523 16 21V18C16 17.4477 16.4477 17 17 
                    17Z" fill="#ffffff"></path> 
                </g> 
                <defs> <clipPath id="clip0_525_137"> <rect width="24" height="24" fill="white"></rect> </clipPath> </defs> 
            </g>
        </svg>
    `


    return `data:image/svg+xml;base64,${btoa(clientIcon)}`;
}


export const getSellerIcon = (seller: number, color: string) => {
    const sellerSvgIcon = `
        <svg viewBox="0 -45 125.00 230.00" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        aria-hidden="true" role="img" class="iconify iconify--gis" fill="#ffffff">
            <style type="text/css">
                    .st0 {
                    fill: #013f47;
                    }

                    .float {
                        animation: float 1.5s ease-in-out infinite;
                        transform-origin: center;
                        
                    }

                    @keyframes float {
                    0%   { transform: translate(12px, 0);}
                    50%  { transform: translate(12px, -30px); }
                    100% { transform: translate(12px, 0); }
                    }
                </style>

            <g class="float">
                <circle cx="50" cy="50" r="60" fill="${color}" stroke="#ffffff" stroke-width="3.2"/>
                <path d="M49.781 23.592C41.947 23.593 34.184 26.96 35 33.688l2 14.624C37.352 50.886 39.09 55 41.688 55h.185L44 80.53c.092
                1.103.892 2 2 2h8c1.108 0 1.908-.897 2-2L58.127 55h.185c2.597 0 4.336-4.115 4.688-6.688l2-14.624c.523-6.734-7.384-10.098-15.219-10.096z" 
                fill="#fff" stroke="#013f47"></path>
                <path d="M50.024 50.908l-.048.126c.016-.038.027-.077.043-.115l.005-.011z" fill="#fff" stroke="#013f47"/>
                <path d="M34.006 69.057C19.88 71.053 10 75.828 10 82.857C10 92.325 26.508 100 50 100s40-7.675 40-17.143c0-7.029-9.879-11.804-24.004-13.8l-1.957 
                3.332C74.685 73.866 82 76.97 82 80.572c0 5.05-14.327 9.143-32 9.143c-17.673 0-32-4.093-32-9.143c-.001-3.59 7.266-6.691 17.945-8.174c-.645-1.114-1.294-2.226-1.94-3.341z"
                fill="#fff" stroke="#013f47"/>
                <circle r="10.5" cy="10.5" cx="50" fill="#fff" stroke="#013f47"/>
            </g>
            <g>
              <rect width="120" height="50" x="2" y="123" rx="20" ry="20" fill="#013f47" stroke="#ffffff" stroke-width="3.2"/>
              <text x="62" y="165" text-anchor="middle" stroke="#fff" fill="#fff" font-size="48">${seller}</text>
            </g>
        </svg>
        `

    return `data:image/svg+xml;base64,${btoa(sellerSvgIcon)}`;
}

export const getDriverIcon = (driver: number, color: string) => {
    const driverSvgIcon = `
        <svg viewBox="0 -45 125.00 230.00" xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        aria-hidden="true" role="img" class="iconify iconify--gis" fill="#ffffff">
            <style type="text/css">
                    .st0 {
                    fill: #013f47;
                    }

                    .float {
                        animation: float 1.5s ease-in-out infinite;
                        transform-origin: center;
                    }

                    @keyframes float {
                    0%   { transform: translate(12px, 0);}
                    50%  { transform: translate(12px, -30px); }
                    100% { transform: translate(12px, 0); }
                    }
                </style>

            <g class="float">
                <circle cx="50" cy="50" r="60" fill="${color}" stroke="#ffffff" stroke-width="3.2"/>
                <g transform="translate(50, 50) scale(1.6) translate(-25, -31.5)">
                    <path d="M2.84375 13C1.273438 13 0 14.277344 0 15.84375L0 42C0 43.566406 1.429688 45 3 45L7.09375 45C7.570313 47.835938 10.03125 50 13 50C15.96875 50 18.429688 47.835938 18.90625 45L28.15625 45C29.722656 45 31 43.722656 31 42.15625L31 15.90625C31 14.304688 29.738281 13 28.1875 13 Z M 33 20L33 45C33.480469 47.832031 36.03125 50 39 50C41.96875 50 44.429688 47.832031 44.90625 45L47 45C48.570313 45 50 43.570313 50 42L50 32.375C50 30.363281 48.550781 28.308594 48.375 28.0625L44.21875 22.5C43.265625 21.351563 41.769531 20 40 20 Z M 38 25L43.59375 25L46.78125 29.25C47.121094 29.730469 48 31.203125 48 32.375L48 33L38 33C37 33 36 32 36 31L36 27C36 25.894531 37 25 38 25 Z M 13 40C15.207031 40 17 41.792969 17 44C17 46.207031 15.207031 48 13 48C10.792969 48 9 46.207031 9 44C9 41.792969 10.792969 40 13 40 Z M 39 40C41.207031 40 43 41.792969 43 44C43 46.207031 41.207031 48 39 48C36.792969 48 35 46.207031 35 44C35 41.792969 36.792969 40 39 40Z" fill="#ffffff"/>
                </g>
            </g>
            <g>
              <rect width="120" height="50" x="2" y="123" rx="20" ry="20" fill="#013f47" stroke="#ffffff" stroke-width="3.2"/>
              <text x="62" y="165" text-anchor="middle" stroke="#fff" fill="#fff" font-size="48">${driver}</text>
            </g>
        </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(driverSvgIcon.trim())}`;
}


export const getIcon = (id: number | null) => {
    if (id) {
        if (id === -1) {
            return sellIcon;
        } else if (id > 0) {
            return noVisitedIcon;
        } else { return visitedIcon }
    } else return noVisitedIcon;
}

export const getStallIcon = (visited: boolean) => visited ? stallVisitedIcon : stallNoVisitedIcon;