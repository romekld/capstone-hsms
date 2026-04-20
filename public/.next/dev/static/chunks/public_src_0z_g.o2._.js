(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/public/src/lib/mockData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mockAnnouncementList",
    ()=>mockAnnouncementList,
    "mockAnnouncements",
    ()=>mockAnnouncements,
    "mockServiceList",
    ()=>mockServiceList,
    "mockServices",
    ()=>mockServices
]);
const mockAnnouncements = [
    {
        id: 1,
        title: "CHO2 Launches New Health Campaign",
        content: "We are excited to announce the launch of our comprehensive health campaign for Dasmariñas City. This initiative focuses on preventive care, health education, and community wellness programs that will benefit all residents.",
        published_at: "2024-03-15T10:00:00Z",
        is_published: true,
        author_name: "Dr. Maria Santos",
        category: "Events",
        summary: "A city-wide preventive care campaign starts this month across all CHO2 community stations.",
        image_url: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80"
    },
    {
        id: 2,
        title: "Free Vaccination Schedule Update",
        content: "The vaccination schedule for children and adults has been updated for the month of March. Please visit our health centers during operating hours to avail of free vaccines including flu, COVID-19 boosters, and routine immunizations.",
        published_at: "2024-03-10T14:30:00Z",
        is_published: true,
        author_name: "Nurse Juan Cruz",
        category: "Health Advisory",
        summary: "Updated immunization schedules are now available for children, adults, and senior citizens.",
        image_url: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=1200&q=80"
    },
    {
        id: 3,
        title: "Health Center Holiday Schedule",
        content: "Please be informed of the adjusted operating hours during the upcoming holidays. Our main health center will maintain emergency services while satellite clinics will have modified schedules.",
        published_at: "2024-03-05T09:15:00Z",
        is_published: true,
        author_name: "Admin Office",
        category: "Notices",
        summary: "Satellite clinics will follow holiday operating hours while emergency services stay available.",
        image_url: "https://images.unsplash.com/photo-1486825586573-7131f7991bdd?auto=format&fit=crop&w=1200&q=80"
    }
];
const mockServices = [
    {
        id: 1,
        name: "Maternal Health Services",
        description: "Comprehensive care for expecting mothers including prenatal check-ups, nutritional counseling, and postpartum support. Our dedicated team ensures safe and healthy pregnancy journey for all mothers in Dasmariñas.",
        category: "Primary Care",
        contact_info: "Phone: (046) 123-4567",
        operating_hours: "8:00 AM - 5:00 PM"
    },
    {
        id: 2,
        name: "Child Immunization",
        description: "Free vaccination programs for children from birth to 12 years old. We provide essential vaccines following the Department of Health's immunization schedule to protect your children from preventable diseases.",
        category: "Preventive Care",
        contact_info: "Phone: (046) 123-4568",
        operating_hours: "9:00 AM - 4:00 PM"
    },
    {
        id: 3,
        name: "Dental Health Services",
        description: "Complete dental care including extraction, cleaning, filling, and oral health education. Regular dental check-ups are essential for maintaining overall health and preventing oral diseases.",
        category: "Dental Care",
        contact_info: "Phone: (046) 123-4569",
        operating_hours: "8:00 AM - 5:00 PM"
    },
    {
        id: 4,
        name: "Laboratory Services",
        description: "Diagnostic laboratory tests including blood chemistry, urinalysis, fecalysis, and other essential tests. Our laboratory is equipped with modern equipment for accurate and timely results.",
        category: "Diagnostic Services",
        contact_info: "Phone: (046) 123-4570",
        operating_hours: "7:00 AM - 3:00 PM"
    },
    {
        id: 5,
        name: "Family Planning",
        description: "Comprehensive family planning services including counseling, contraceptive methods, and reproductive health education. We support informed choices for healthy families and responsible parenthood.",
        category: "Reproductive Health",
        contact_info: "Phone: (046) 123-4571",
        operating_hours: "8:00 AM - 5:00 PM"
    }
];
const mockAnnouncementList = {
    data: mockAnnouncements,
    pagination: {
        page: 1,
        limit: 20,
        total: mockAnnouncements.length
    }
};
const mockServiceList = {
    data: mockServices
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/public/src/lib/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "publicApi",
    ()=>publicApi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/public/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/src/lib/mockData.ts [app-client] (ecmascript)");
;
;
const USE_MOCK_DATA = __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
// Create axios instance for real API calls
const apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});
const publicApi = {
    getAnnouncements: async (page = 1, limit = 20)=>{
        if (USE_MOCK_DATA) {
            // Simulate API delay
            await new Promise((resolve)=>setTimeout(resolve, 500));
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockAnnouncementList"];
        }
        const response = await apiClient.get(`/api/public/announcements?page=${page}&limit=${limit}`);
        return {
            ...response.data,
            data: (response.data?.data ?? []).map(normalizeAnnouncement)
        };
    },
    getAnnouncement: async (id)=>{
        if (USE_MOCK_DATA) {
            // Simulate API delay
            await new Promise((resolve)=>setTimeout(resolve, 300));
            const announcement = __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockAnnouncementList"].data.find((a)=>a.id === id);
            if (!announcement) {
                throw new Error('Announcement not found');
            }
            return {
                data: announcement
            };
        }
        const response = await apiClient.get(`/api/public/announcements/${id}`);
        return {
            ...response.data,
            data: normalizeAnnouncement(response.data?.data)
        };
    },
    getServices: async ()=>{
        if (USE_MOCK_DATA) {
            // Simulate API delay
            await new Promise((resolve)=>setTimeout(resolve, 400));
            return __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$mockData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["mockServiceList"];
        }
        const response = await apiClient.get('/api/public/services');
        return response.data;
    },
    getPublicAnnouncements: async ()=>{
        const response = await publicApi.getAnnouncements(1, 60);
        return response.data;
    }
};
function normalizeAnnouncement(announcement) {
    const fallbackCategory = inferCategory(announcement);
    const summary = announcement.summary ?? announcement.content?.slice(0, 140)?.trim();
    return {
        ...announcement,
        category: announcement.category ?? fallbackCategory,
        summary: summary && summary.length > 0 ? `${summary.replace(/\s+/g, ' ').trim()}${summary.length >= 140 ? '...' : ''}` : ''
    };
}
function inferCategory(announcement) {
    const text = `${announcement.title} ${announcement.content}`.toLowerCase();
    if (text.includes('vaccine') || text.includes('advisory') || text.includes('health')) {
        return 'Health Advisory';
    }
    if (text.includes('launch') || text.includes('campaign') || text.includes('event') || text.includes('program')) {
        return 'Events';
    }
    return 'Notices';
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/public/src/lib/barangays.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BARANGAY_OPTIONS",
    ()=>BARANGAY_OPTIONS
]);
const BARANGAY_OPTIONS = [
    'Burol I',
    'Burol II',
    'Burol III',
    'Emmanuel Bergado I',
    'Emmanuel Bergado II',
    'Fatima I',
    'Fatima II',
    'Fatima III',
    'Luzviminda I',
    'Luzviminda II',
    'San Andres I',
    'San Andres II',
    'San Antonio de Padua I',
    'San Antonio de Padua II',
    'San Francisco I',
    'San Francisco II',
    'San Lorenzo Ruiz I',
    'San Lorenzo Ruiz II',
    'San Luis I',
    'San Luis II',
    'San Mateo',
    'San Nicolas I',
    'San Nicolas II',
    'San Roque (Sta. Cristina II)',
    'San Simon (Barangay 7)',
    'Santa Cristina I',
    'Santa Cristina II',
    'Santa Cruz I',
    'Santa Cruz II',
    'Santa Fe',
    'Santa Maria (Barangay 20)',
    'Victoria Reyes'
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/public/src/lib/healthPrograms.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "healthPrograms",
    ()=>healthPrograms
]);
const healthPrograms = [
    {
        id: 'consultation',
        title: 'CONSULTATION',
        description: 'General health consultations for routine checkups, acute symptoms, and medical advice from healthcare professionals.'
    },
    {
        id: 'animal-bite',
        title: 'ANIMAL BITE',
        description: 'Immediate assessment and post-exposure management for dog, cat, and other animal bite cases.'
    },
    {
        id: 'lying-in',
        title: 'LYING-IN',
        description: 'Maternal care support including prenatal monitoring and safe birthing assistance in accredited facilities.'
    },
    {
        id: 'family-planning',
        title: 'FAMILY PLANNING',
        description: 'Counseling and reproductive health services to support informed and responsible family planning decisions.'
    },
    {
        id: 'laboratory',
        title: 'LABORATORY',
        description: 'Basic diagnostic laboratory testing services to support medical screening, diagnosis, and treatment planning.'
    },
    {
        id: 'tb-dots',
        title: 'TB DOTS',
        description: 'Directly Observed Treatment, Short-course services for tuberculosis screening, treatment, and follow-up care.'
    },
    {
        id: 'counseling',
        title: 'COUNSELING',
        description: 'Health and wellness counseling services for patients and families needing guidance, support, and care planning.'
    },
    {
        id: 'drug-rehab',
        title: 'DRUG REHAB',
        description: 'Community-based rehabilitation support and referral services for substance use recovery and reintegration.'
    },
    {
        id: 'immunization',
        title: 'IMMUNIZATION',
        description: 'Vaccination services for children, adults, and priority groups to prevent vaccine-preventable diseases.'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/public/src/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/public/src/components/ui/app-select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AppSelect",
    ()=>AppSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$select$2f$index$2e$parts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Select$3e$__ = __turbopack_context__.i("[project]/public/node_modules/@base-ui/react/esm/select/index.parts.js [app-client] (ecmascript) <export * as Select>");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/public/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/public/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/src/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function normalizeOption(option) {
    if (typeof option === 'string') {
        return {
            label: option,
            value: option,
            disabled: false
        };
    }
    return {
        label: option.label,
        value: option.value,
        disabled: option.disabled ?? false
    };
}
function AppSelect({ id, value, options, onValueChange, className, popupClassName, itemClassName, placeholder, sideOffset = 8 }) {
    _s();
    const normalizedOptions = __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "AppSelect.useMemo[normalizedOptions]": ()=>options.map(normalizeOption)
    }["AppSelect.useMemo[normalizedOptions]"], [
        options
    ]);
    const items = __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "AppSelect.useMemo[items]": ()=>normalizedOptions.map({
                "AppSelect.useMemo[items]": (option)=>({
                        label: option.label,
                        value: option.value
                    })
            }["AppSelect.useMemo[items]"])
    }["AppSelect.useMemo[items]"], [
        normalizedOptions
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$select$2f$index$2e$parts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Select$3e$__["Select"].Root, {
        items: items,
        modal: false,
        value: value,
        onValueChange: (nextValue)=>{
            if (nextValue !== null) {
                onValueChange(nextValue);
            }
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$select$2f$index$2e$parts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Select$3e$__["Select"].Trigger, {
                id: id,
                type: "button",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex w-full items-center justify-between gap-3 text-left outline-none transition', className),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$select$2f$index$2e$parts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Select$3e$__["Select"].Value, {
                        placeholder: placeholder,
                        className: "min-w-0 flex-1 truncate"
                    }, void 0, false, {
                        fileName: "[project]/public/src/components/ui/app-select.tsx",
                        lineNumber: 89,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        className: "h-4 w-4 shrink-0 text-current/70"
                    }, void 0, false, {
                        fileName: "[project]/public/src/components/ui/app-select.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/public/src/components/ui/app-select.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$select$2f$index$2e$parts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Select$3e$__["Select"].Portal, {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$select$2f$index$2e$parts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Select$3e$__["Select"].Positioner, {
                    align: "start",
                    alignItemWithTrigger: false,
                    side: "bottom",
                    sideOffset: sideOffset,
                    className: "z-50",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$select$2f$index$2e$parts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Select$3e$__["Select"].Popup, {
                        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-[0_18px_40px_-18px_rgba(5,36,16,0.35)]', popupClassName),
                        style: {
                            width: 'var(--anchor-width)'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$select$2f$index$2e$parts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Select$3e$__["Select"].List, {
                            className: "dropdown-scrollbar overflow-y-auto p-1",
                            style: {
                                maxHeight: 'min(18rem, var(--available-height))'
                            },
                            children: normalizedOptions.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$select$2f$index$2e$parts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Select$3e$__["Select"].Item, {
                                    value: option.value,
                                    disabled: option.disabled,
                                    className: ({ disabled, highlighted, selected })=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])('flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none transition-colors', highlighted && 'bg-emerald-50 text-emerald-950', selected && 'bg-emerald-100 font-medium text-emerald-950', disabled && 'cursor-not-allowed opacity-50', itemClassName),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "truncate",
                                            children: option.label
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/components/ui/app-select.tsx",
                                            lineNumber: 130,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$select$2f$index$2e$parts$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__Select$3e$__["Select"].ItemIndicator, {
                                            className: "shrink-0 text-emerald-700",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                className: "h-4 w-4"
                                            }, void 0, false, {
                                                fileName: "[project]/public/src/components/ui/app-select.tsx",
                                                lineNumber: 132,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/components/ui/app-select.tsx",
                                            lineNumber: 131,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, option.value, true, {
                                    fileName: "[project]/public/src/components/ui/app-select.tsx",
                                    lineNumber: 116,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/public/src/components/ui/app-select.tsx",
                            lineNumber: 111,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/public/src/components/ui/app-select.tsx",
                        lineNumber: 104,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/public/src/components/ui/app-select.tsx",
                    lineNumber: 97,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/public/src/components/ui/app-select.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/public/src/components/ui/app-select.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
_s(AppSelect, "2GX781n5KcCbfVi5FGYlRlaJ+W0=");
_c = AppSelect;
var _c;
__turbopack_context__.k.register(_c, "AppSelect");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/public/src/views/Home.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Home",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/src/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$barangays$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/src/lib/barangays.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$healthPrograms$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/src/lib/healthPrograms.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$components$2f$ui$2f$app$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/public/src/components/ui/app-select.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/public/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__ = __turbopack_context__.i("[project]/public/node_modules/lucide-react/dist/esm/icons/activity.js [app-client] (ecmascript) <export default as Activity>");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/public/node_modules/lucide-react/dist/esm/icons/shield.js [app-client] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/public/node_modules/lucide-react/dist/esm/icons/heart.js [app-client] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/public/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/public/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/public/node_modules/lucide-react/dist/esm/icons/phone.js [app-client] (ecmascript) <export default as Phone>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
const HOME_BARANGAY_OPTIONS = [
    {
        label: 'All Barangays',
        value: 'all'
    },
    ...__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$barangays$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BARANGAY_OPTIONS"].map((barangay)=>({
            label: barangay,
            value: barangay
        }))
];
function Home() {
    _s();
    const [featuredAnnouncements, setFeaturedAnnouncements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [featuredServices, setFeaturedServices] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedBarangay, setSelectedBarangay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const fallbackAnnouncements = [
        {
            id: 901,
            title: 'Quarterly Polio Vaccination Drive',
            summary: 'Health workers will run a barangay-wide vaccination drive this week for children below five years old.',
            date: 'March 18, 2026',
            image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 902,
            title: 'Dengue Prevention Week',
            summary: 'Free fogging and mosquito habitat checks will be conducted in priority zones with high case counts.',
            date: 'March 11, 2026',
            image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 903,
            title: 'Free Optical Mission',
            summary: 'Residents may register for eye screening and reading glasses distribution at the CHO outreach desk.',
            date: 'March 6, 2026',
            image: 'https://images.unsplash.com/photo-1580281657527-47f249e8f4df?auto=format&fit=crop&w=600&q=80'
        }
    ];
    const serviceIcons = [
        __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$activity$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Activity$3e$__["Activity"],
        __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
        __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
        __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
        __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"],
        __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"]
    ];
    const formatPublishedDate = (dateString)=>{
        const parsed = new Date(dateString);
        if (Number.isNaN(parsed.getTime())) return 'Recent update';
        return parsed.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };
    const scrollToLatestAnnouncements = ()=>{
        const section = document.getElementById('latest-announcements');
        if (!section) return;
        const navOffset = 96;
        const top = section.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({
            top,
            behavior: 'smooth'
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            const loadHomeData = {
                "Home.useEffect.loadHomeData": async ()=>{
                    try {
                        const announcementsResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["publicApi"].getAnnouncements(1, 3);
                        const servicesResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["publicApi"].getServices();
                        setFeaturedAnnouncements(announcementsResponse.data.slice(0, 3));
                        setFeaturedServices(servicesResponse.data.slice(0, 6));
                    } catch (error) {
                        console.error('Error loading home data:', error);
                    } finally{
                        setLoading(false);
                    }
                }
            }["Home.useEffect.loadHomeData"];
            loadHomeData();
        }
    }["Home.useEffect"], []);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "h-3 w-3 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]"
                            }, void 0, false, {
                                fileName: "[project]/public/src/views/Home.tsx",
                                lineNumber: 104,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "h-3 w-3 rounded-full bg-primary/80 animate-bounce [animation-delay:-0.15s]"
                            }, void 0, false, {
                                fileName: "[project]/public/src/views/Home.tsx",
                                lineNumber: 105,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "h-3 w-3 rounded-full bg-primary animate-bounce"
                            }, void 0, false, {
                                fileName: "[project]/public/src/views/Home.tsx",
                                lineNumber: 106,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/public/src/views/Home.tsx",
                        lineNumber: 103,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-muted-foreground",
                        children: "Loading health services..."
                    }, void 0, false, {
                        fileName: "[project]/public/src/views/Home.tsx",
                        lineNumber: 108,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/public/src/views/Home.tsx",
                lineNumber: 102,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/public/src/views/Home.tsx",
            lineNumber: 101,
            columnNumber: 7
        }, this);
    }
    const displayedProgramCards = __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$lib$2f$healthPrograms$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["healthPrograms"].slice(0, 4);
    const announcementRows = featuredAnnouncements.length > 0 ? featuredAnnouncements.map((announcement, index)=>({
            id: announcement.id,
            title: announcement.title,
            summary: announcement.summary || `${announcement.content.slice(0, 110)}...`,
            date: formatPublishedDate(announcement.published_at),
            image: announcement.image_url || fallbackAnnouncements[index % fallbackAnnouncements.length].image
        })) : fallbackAnnouncements;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-[#edf2f3]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "relative overflow-hidden pb-14 pt-10 lg:pb-20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pointer-events-none absolute inset-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute -left-16 top-4 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl"
                            }, void 0, false, {
                                fileName: "[project]/public/src/views/Home.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute right-8 top-14 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl"
                            }, void 0, false, {
                                fileName: "[project]/public/src/views/Home.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/public/src/views/Home.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-main text-xs font-semibold uppercase tracking-[0.28em] text-emerald-800/70",
                                                    children: "Community Health Network"
                                                }, void 0, false, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    className: "font-main text-4xl font-extrabold leading-[0.95] text-emerald-950 md:text-6xl lg:text-7xl",
                                                    children: [
                                                        "City Health Office II,",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "block text-emerald-700",
                                                            children: " Serving Every Barangay"
                                                        }, void 0, false, {
                                                            fileName: "[project]/public/src/views/Home.tsx",
                                                            lineNumber: 143,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 141,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "max-w-xl text-base text-emerald-900/70 md:text-lg",
                                                    children: "Access essential medical services, health programs, and coordinated outreach built for every barangay in Dasmariñas City."
                                                }, void 0, false, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 137,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-full max-w-sm space-y-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            htmlFor: "service-category",
                                                            className: "font-main text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800/75",
                                                            children: "Select Barangay"
                                                        }, void 0, false, {
                                                            fileName: "[project]/public/src/views/Home.tsx",
                                                            lineNumber: 152,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$src$2f$components$2f$ui$2f$app$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AppSelect"], {
                                                            id: "service-category",
                                                            value: selectedBarangay,
                                                            onValueChange: setSelectedBarangay,
                                                            options: HOME_BARANGAY_OPTIONS,
                                                            className: "w-full rounded-xl border border-transparent bg-white/90 px-4 py-3 text-sm font-medium text-emerald-900 shadow-md shadow-emerald-900/5 ring-0 transition focus:shadow-lg"
                                                        }, void 0, false, {
                                                            fileName: "[project]/public/src/views/Home.tsx",
                                                            lineNumber: 155,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 151,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                            href: "/services",
                                                            className: "inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:-translate-y-0.5 hover:bg-emerald-800",
                                                            children: [
                                                                "See all services",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                                                    className: "h-4 w-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                                    lineNumber: 170,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/public/src/views/Home.tsx",
                                                            lineNumber: 165,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            onClick: scrollToLatestAnnouncements,
                                                            className: "inline-flex items-center rounded-xl bg-white/80 px-5 py-3 text-sm font-semibold text-emerald-900 shadow-md shadow-emerald-900/5 transition hover:bg-white",
                                                            children: "Latest announcements"
                                                        }, void 0, false, {
                                                            fileName: "[project]/public/src/views/Home.tsx",
                                                            lineNumber: 172,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 164,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 150,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/public/src/views/Home.tsx",
                                    lineNumber: 136,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative min-h-[320px] overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-900 via-cyan-700 to-emerald-500 p-6 shadow-2xl shadow-cyan-900/25",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&w=1300&q=80",
                                            alt: "Healthcare professionals at work",
                                            className: "h-full min-h-[300px] w-full rounded-2xl object-cover opacity-75",
                                            loading: "lazy"
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 184,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute bottom-6 left-6 rounded-2xl bg-emerald-200/90 px-4 py-3 shadow-xl shadow-emerald-950/20 backdrop-blur-sm",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold uppercase tracking-[0.18em] text-emerald-950/70",
                                                    children: "Certified Care"
                                                }, void 0, false, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 192,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-main text-sm font-bold text-emerald-950",
                                                    children: featuredServices[0]?.name || 'Prenatal Care'
                                                }, void 0, false, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 193,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 191,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/public/src/views/Home.tsx",
                                    lineNumber: 183,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/public/src/views/Home.tsx",
                            lineNumber: 135,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/public/src/views/Home.tsx",
                        lineNumber: 134,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/public/src/views/Home.tsx",
                lineNumber: 128,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "pb-12 lg:pb-16",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-8 flex flex-wrap items-end justify-between gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-main text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/75",
                                            children: "Services • CHO2"
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 206,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "font-main text-3xl font-extrabold text-emerald-950 md:text-4xl",
                                            children: "Core Health Programs"
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 207,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/public/src/views/Home.tsx",
                                    lineNumber: 205,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/services",
                                    className: "inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-50 transition hover:bg-emerald-800",
                                    children: [
                                        "See all services",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                            className: "h-3.5 w-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 214,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/public/src/views/Home.tsx",
                                    lineNumber: 209,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/public/src/views/Home.tsx",
                            lineNumber: 204,
                            columnNumber: 11
                        }, this),
                        displayedProgramCards.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
                            children: displayedProgramCards.map((program, index)=>{
                                const Icon = serviceIcons[index % serviceIcons.length];
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/services",
                                    className: "block rounded-2xl bg-white/90 p-5 shadow-sm shadow-emerald-900/10 transition duration-200 hover:-translate-y-1 hover:shadow-lg",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mb-4 flex items-start justify-between gap-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                    className: "h-5 w-5"
                                                }, void 0, false, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 231,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/public/src/views/Home.tsx",
                                                lineNumber: 230,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 229,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-main text-lg font-bold text-emerald-950",
                                            children: program.title
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 234,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-2 text-sm leading-6 text-emerald-900/70",
                                            children: program.description
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 235,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, program.id, true, {
                                    fileName: "[project]/public/src/views/Home.tsx",
                                    lineNumber: 224,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/public/src/views/Home.tsx",
                            lineNumber: 219,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-2xl bg-white/85 p-6 text-sm text-emerald-900/70 shadow-sm shadow-emerald-900/10",
                            children: "No services available for this category right now."
                        }, void 0, false, {
                            fileName: "[project]/public/src/views/Home.tsx",
                            lineNumber: 241,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/public/src/views/Home.tsx",
                    lineNumber: 203,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/public/src/views/Home.tsx",
                lineNumber: 202,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                id: "latest-announcements",
                className: "pb-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.4fr_1fr] lg:gap-10 lg:px-8",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-main text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/75",
                                    children: "Updates • Newsfeed"
                                }, void 0, false, {
                                    fileName: "[project]/public/src/views/Home.tsx",
                                    lineNumber: 251,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "font-main text-3xl font-extrabold text-emerald-950 md:text-4xl",
                                    children: "Latest Health Announcements"
                                }, void 0, false, {
                                    fileName: "[project]/public/src/views/Home.tsx",
                                    lineNumber: 252,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm leading-6 text-emerald-900/70",
                                    children: "Read real-time advisories, outreach notices, and service updates from City Health Office II."
                                }, void 0, false, {
                                    fileName: "[project]/public/src/views/Home.tsx",
                                    lineNumber: 253,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/announcements",
                                    className: "inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-50 transition hover:bg-emerald-800",
                                    children: [
                                        "See all updates",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                                            className: "h-3.5 w-3.5"
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 261,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/public/src/views/Home.tsx",
                                    lineNumber: 256,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/public/src/views/Home.tsx",
                            lineNumber: 250,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: announcementRows.map((announcement)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/announcements#announcement-${announcement.id}`,
                                    className: "group flex gap-3 rounded-xl bg-white/90 p-3 shadow-sm shadow-emerald-900/10 transition hover:bg-white hover:shadow-md",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: announcement.image,
                                            alt: announcement.title,
                                            className: "h-16 w-16 rounded-lg object-cover",
                                            loading: "lazy"
                                        }, void 0, false, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 272,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0 flex-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-semibold uppercase tracking-wide text-emerald-700/75",
                                                    children: announcement.date
                                                }, void 0, false, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 279,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-main text-sm font-bold text-emerald-950 transition group-hover:text-emerald-700 md:text-base",
                                                    children: announcement.title
                                                }, void 0, false, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 280,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$public$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-1 text-xs text-emerald-900/65 md:text-sm",
                                                    children: announcement.summary
                                                }, void 0, false, {
                                                    fileName: "[project]/public/src/views/Home.tsx",
                                                    lineNumber: 283,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/public/src/views/Home.tsx",
                                            lineNumber: 278,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, announcement.id, true, {
                                    fileName: "[project]/public/src/views/Home.tsx",
                                    lineNumber: 267,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/public/src/views/Home.tsx",
                            lineNumber: 265,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/public/src/views/Home.tsx",
                    lineNumber: 249,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/public/src/views/Home.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/public/src/views/Home.tsx",
        lineNumber: 127,
        columnNumber: 5
    }, this);
}
_s(Home, "QeUuINasLF15U/3z8DN935memnE=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=public_src_0z_g.o2._.js.map