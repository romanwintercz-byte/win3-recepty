
import React from 'react';

const IconBase = ({ children, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {children}
  </svg>
);

export const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></IconBase>
);

export const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></IconBase>
);

export const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></IconBase>
);

export const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /></IconBase>
);

export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></IconBase>
);

export const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></IconBase>
);

export const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></IconBase>
);

export const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-1.125 6.01 6.01 0 0 0 1.5-1.125m-3 2.25a6.01 6.01 0 0 1-1.5-1.125 6.01 6.01 0 0 1-1.5-1.125m3 2.25C9 12 7.5 10.5 7.5 9S9 6 12 6s4.5 1.5 4.5 3-1.5 3-4.5 3Zm0 0v-5.25m0 5.25v2.625m0-2.625a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></IconBase>
);

export const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M3 12h18" /></IconBase>
);

export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></IconBase>
);

export const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347c-.75.412-1.667-.13-1.667-.986V5.653Z" /></IconBase>
);

export const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></IconBase>
);

export const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></IconBase>
);

export const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></IconBase>
);

export const MapIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <IconBase {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-1.5V21m3.75-18v12.75l-4.5-2.25-6 3-4.5-2.25V3l4.5 2.25 6-3 4.5 2.25Z" /></IconBase>
);
