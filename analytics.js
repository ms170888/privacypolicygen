/**
 * Analytics Module for Static Sites
 * Client-side analytics tracking with localStorage persistence
 *
 * Features:
 * - Page view tracking
 * - Event/action tracking
 * - Time on page measurement
 * - Session tracking
 * - Data export
 */

const Analytics = (function() {
    'use strict';

    // Configuration
    const STORAGE_KEY = 'site_analytics_data';
    const SESSION_KEY = 'site_analytics_session';
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    // Private state
    let sessionId = null;
    let pageLoadTime = null;
    let isTracking = false;

    /**
     * Generate a unique ID
     */
    function generateId() {
        return 'id_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    }

    /**
     * Get or create visitor ID (persistent across sessions)
     */
    function getVisitorId() {
        let visitorId = localStorage.getItem('site_analytics_visitor');
        if (!visitorId) {
            visitorId = generateId();
            localStorage.setItem('site_analytics_visitor', visitorId);
        }
        return visitorId;
    }

    /**
     * Get or create session
     */
    function getSession() {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (stored) {
            const session = JSON.parse(stored);
            if (Date.now() - session.lastActivity < SESSION_TIMEOUT) {
                session.lastActivity = Date.now();
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
                return session;
            }
        }

        // Create new session
        const newSession = {
            id: generateId(),
            startTime: Date.now(),
            lastActivity: Date.now(),
            pageViews: 0
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
        return newSession;
    }

    /**
     * Get analytics data from storage
     */
    function getData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Analytics: Failed to parse stored data', e);
            }
        }
        return {
            pageViews: [],
            events: [],
            sessions: [],
            timeOnPage: [],
            visitors: {},
            summary: {
                totalPageViews: 0,
                totalEvents: 0,
                totalSessions: 0,
                uniqueVisitors: 0
            }
        };
    }

    /**
     * Save analytics data to storage
     */
    function saveData(data) {
        try {
            // Limit data to last 1000 entries per category to prevent localStorage overflow
            const limitedData = {
                ...data,
                pageViews: data.pageViews.slice(-1000),
                events: data.events.slice(-1000),
                sessions: data.sessions.slice(-500),
                timeOnPage: data.timeOnPage.slice(-1000)
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedData));
        } catch (e) {
            console.error('Analytics: Failed to save data', e);
            // If storage is full, clear old data
            if (e.name === 'QuotaExceededError') {
                const freshData = {
                    pageViews: data.pageViews.slice(-100),
                    events: data.events.slice(-100),
                    sessions: data.sessions.slice(-50),
                    timeOnPage: data.timeOnPage.slice(-100),
                    visitors: {},
                    summary: data.summary
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(freshData));
            }
        }
    }

    /**
     * Get device/browser info
     */
    function getDeviceInfo() {
        const ua = navigator.userAgent;
        let device = 'Desktop';
        let browser = 'Unknown';

        // Detect device
        if (/Android/i.test(ua)) device = 'Android';
        else if (/iPhone|iPad|iPod/i.test(ua)) device = 'iOS';
        else if (/Windows Phone/i.test(ua)) device = 'Windows Phone';
        else if (/Tablet|iPad/i.test(ua)) device = 'Tablet';
        else if (/Mobile/i.test(ua)) device = 'Mobile';

        // Detect browser
        if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
        else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
        else if (/Firefox/i.test(ua)) browser = 'Firefox';
        else if (/Edg/i.test(ua)) browser = 'Edge';
        else if (/MSIE|Trident/i.test(ua)) browser = 'IE';

        return { device, browser };
    }

    /**
     * Track page view
     */
    function trackPageView(pageName) {
        if (!isTracking) return;

        const data = getData();
        const session = getSession();
        const visitorId = getVisitorId();
        const deviceInfo = getDeviceInfo();

        // Update session
        session.pageViews++;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

        // Record page view
        const pageView = {
            id: generateId(),
            page: pageName || window.location.pathname,
            timestamp: Date.now(),
            date: new Date().toISOString().split('T')[0],
            sessionId: session.id,
            visitorId: visitorId,
            referrer: document.referrer || 'direct',
            device: deviceInfo.device,
            browser: deviceInfo.browser
        };

        data.pageViews.push(pageView);
        data.summary.totalPageViews++;

        // Track unique visitors
        if (!data.visitors[visitorId]) {
            data.visitors[visitorId] = {
                firstSeen: Date.now(),
                lastSeen: Date.now(),
                pageViews: 0,
                events: 0
            };
            data.summary.uniqueVisitors++;
        }
        data.visitors[visitorId].lastSeen = Date.now();
        data.visitors[visitorId].pageViews++;

        // Check for new session
        const existingSession = data.sessions.find(s => s.id === session.id);
        if (!existingSession) {
            data.sessions.push({
                id: session.id,
                visitorId: visitorId,
                startTime: session.startTime,
                device: deviceInfo.device,
                browser: deviceInfo.browser,
                date: new Date().toISOString().split('T')[0]
            });
            data.summary.totalSessions++;
        }

        saveData(data);
        pageLoadTime = Date.now();
    }

    /**
     * Track custom event
     */
    function trackEvent(category, action, label, value) {
        if (!isTracking) return;

        const data = getData();
        const session = getSession();
        const visitorId = getVisitorId();

        const event = {
            id: generateId(),
            category: category || 'general',
            action: action || 'click',
            label: label || '',
            value: value || 0,
            timestamp: Date.now(),
            date: new Date().toISOString().split('T')[0],
            sessionId: session.id,
            visitorId: visitorId,
            page: window.location.pathname
        };

        data.events.push(event);
        data.summary.totalEvents++;

        if (data.visitors[visitorId]) {
            data.visitors[visitorId].events++;
        }

        saveData(data);
    }

    /**
     * Track time on page (call on page unload)
     */
    function trackTimeOnPage() {
        if (!isTracking || !pageLoadTime) return;

        const data = getData();
        const session = getSession();
        const timeSpent = Math.round((Date.now() - pageLoadTime) / 1000); // seconds

        const timeEntry = {
            page: window.location.pathname,
            seconds: timeSpent,
            timestamp: Date.now(),
            date: new Date().toISOString().split('T')[0],
            sessionId: session.id
        };

        data.timeOnPage.push(timeEntry);
        saveData(data);
    }

    /**
     * Get analytics report
     */
    function getReport(options = {}) {
        const data = getData();
        const now = Date.now();
        const daysBack = options.days || 30;
        const cutoff = now - (daysBack * 24 * 60 * 60 * 1000);

        // Filter by date range
        const recentPageViews = data.pageViews.filter(pv => pv.timestamp >= cutoff);
        const recentEvents = data.events.filter(e => e.timestamp >= cutoff);
        const recentSessions = data.sessions.filter(s => s.startTime >= cutoff);
        const recentTimeOnPage = data.timeOnPage.filter(t => t.timestamp >= cutoff);

        // Calculate metrics
        const uniqueVisitorsSet = new Set(recentPageViews.map(pv => pv.visitorId));

        // Page views by day
        const pageViewsByDay = {};
        recentPageViews.forEach(pv => {
            pageViewsByDay[pv.date] = (pageViewsByDay[pv.date] || 0) + 1;
        });

        // Events by category
        const eventsByCategory = {};
        recentEvents.forEach(e => {
            if (!eventsByCategory[e.category]) {
                eventsByCategory[e.category] = {};
            }
            eventsByCategory[e.category][e.action] = (eventsByCategory[e.category][e.action] || 0) + 1;
        });

        // Device breakdown
        const deviceBreakdown = {};
        recentPageViews.forEach(pv => {
            deviceBreakdown[pv.device] = (deviceBreakdown[pv.device] || 0) + 1;
        });

        // Browser breakdown
        const browserBreakdown = {};
        recentPageViews.forEach(pv => {
            browserBreakdown[pv.browser] = (browserBreakdown[pv.browser] || 0) + 1;
        });

        // Average time on page
        const avgTimeOnPage = recentTimeOnPage.length > 0
            ? Math.round(recentTimeOnPage.reduce((sum, t) => sum + t.seconds, 0) / recentTimeOnPage.length)
            : 0;

        // Time on page distribution
        const timeDistribution = {
            'Under 30s': 0,
            '30s - 2min': 0,
            '2min - 5min': 0,
            '5min - 10min': 0,
            'Over 10min': 0
        };
        recentTimeOnPage.forEach(t => {
            if (t.seconds < 30) timeDistribution['Under 30s']++;
            else if (t.seconds < 120) timeDistribution['30s - 2min']++;
            else if (t.seconds < 300) timeDistribution['2min - 5min']++;
            else if (t.seconds < 600) timeDistribution['5min - 10min']++;
            else timeDistribution['Over 10min']++;
        });

        // Top actions (key actions taken)
        const topActions = {};
        recentEvents.forEach(e => {
            const key = `${e.category}: ${e.action}`;
            topActions[key] = (topActions[key] || 0) + 1;
        });
        const sortedActions = Object.entries(topActions)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        // Conversion funnel (events in order)
        const funnelSteps = {};
        recentEvents.forEach(e => {
            if (e.category === 'funnel') {
                funnelSteps[e.action] = (funnelSteps[e.action] || 0) + 1;
            }
        });

        return {
            period: `Last ${daysBack} days`,
            summary: {
                totalPageViews: recentPageViews.length,
                uniqueVisitors: uniqueVisitorsSet.size,
                totalSessions: recentSessions.length,
                totalEvents: recentEvents.length,
                avgTimeOnPage: avgTimeOnPage,
                avgTimeFormatted: formatTime(avgTimeOnPage)
            },
            pageViewsByDay,
            eventsByCategory,
            deviceBreakdown,
            browserBreakdown,
            timeDistribution,
            topActions: sortedActions,
            funnelSteps,
            allTimeStats: data.summary,
            rawData: {
                pageViews: recentPageViews,
                events: recentEvents,
                sessions: recentSessions,
                timeOnPage: recentTimeOnPage
            }
        };
    }

    /**
     * Format seconds to readable time
     */
    function formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }

    /**
     * Export data as CSV
     */
    function exportCSV(type = 'all') {
        const data = getData();
        let csv = '';
        let filename = 'analytics';

        switch (type) {
            case 'pageviews':
                csv = 'ID,Page,Date,Time,Session,Visitor,Device,Browser,Referrer\n';
                data.pageViews.forEach(pv => {
                    const time = new Date(pv.timestamp).toLocaleTimeString();
                    csv += `${pv.id},"${pv.page}",${pv.date},${time},${pv.sessionId},${pv.visitorId},${pv.device},${pv.browser},"${pv.referrer}"\n`;
                });
                filename = 'analytics_pageviews';
                break;

            case 'events':
                csv = 'ID,Category,Action,Label,Value,Date,Time,Page,Session,Visitor\n';
                data.events.forEach(e => {
                    const time = new Date(e.timestamp).toLocaleTimeString();
                    csv += `${e.id},${e.category},${e.action},"${e.label}",${e.value},${e.date},${time},"${e.page}",${e.sessionId},${e.visitorId}\n`;
                });
                filename = 'analytics_events';
                break;

            case 'sessions':
                csv = 'ID,Visitor,Start Date,Start Time,Device,Browser\n';
                data.sessions.forEach(s => {
                    const time = new Date(s.startTime).toLocaleTimeString();
                    csv += `${s.id},${s.visitorId},${s.date},${time},${s.device},${s.browser}\n`;
                });
                filename = 'analytics_sessions';
                break;

            case 'timeonpage':
                csv = 'Page,Seconds,Date,Time,Session\n';
                data.timeOnPage.forEach(t => {
                    const time = new Date(t.timestamp).toLocaleTimeString();
                    csv += `"${t.page}",${t.seconds},${t.date},${time},${t.sessionId}\n`;
                });
                filename = 'analytics_time';
                break;

            default:
                // Summary report
                const report = getReport();
                csv = 'Metric,Value\n';
                csv += `Total Page Views,${report.summary.totalPageViews}\n`;
                csv += `Unique Visitors,${report.summary.uniqueVisitors}\n`;
                csv += `Total Sessions,${report.summary.totalSessions}\n`;
                csv += `Total Events,${report.summary.totalEvents}\n`;
                csv += `Average Time on Page,${report.summary.avgTimeFormatted}\n`;
                csv += '\nPage Views by Day\nDate,Count\n';
                Object.entries(report.pageViewsByDay).forEach(([date, count]) => {
                    csv += `${date},${count}\n`;
                });
                csv += '\nDevice Breakdown\nDevice,Count\n';
                Object.entries(report.deviceBreakdown).forEach(([device, count]) => {
                    csv += `${device},${count}\n`;
                });
                csv += '\nTop Actions\nAction,Count\n';
                report.topActions.forEach(([action, count]) => {
                    csv += `"${action}",${count}\n`;
                });
                filename = 'analytics_summary';
        }

        // Download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);

        return true;
    }

    /**
     * Clear all analytics data
     */
    function clearData() {
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        return true;
    }

    /**
     * Initialize tracking
     */
    function init() {
        if (isTracking) return;
        isTracking = true;

        // Track initial page view
        trackPageView();

        // Track time on page before leaving
        window.addEventListener('beforeunload', trackTimeOnPage);
        window.addEventListener('pagehide', trackTimeOnPage);

        // Track visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                trackTimeOnPage();
            } else {
                pageLoadTime = Date.now();
            }
        });

        console.log('[Analytics] Tracking initialized');
    }

    /**
     * Stop tracking
     */
    function stop() {
        isTracking = false;
        window.removeEventListener('beforeunload', trackTimeOnPage);
        window.removeEventListener('pagehide', trackTimeOnPage);
        console.log('[Analytics] Tracking stopped');
    }

    // Public API
    return {
        init,
        stop,
        trackPageView,
        trackEvent,
        trackTimeOnPage,
        getReport,
        exportCSV,
        clearData,
        getData,
        getVisitorId: getVisitorId
    };
})();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Analytics.init());
} else {
    Analytics.init();
}
