import { useState, useEffect } from 'react';

/**
 * Custom hook for live Chennai (IST) time
 * IST is UTC+5:30
 * Auto-updates every second
 */
const useChennaiTime = () => {
    const getChennaiDate = () => {
        // Create a date object with IST timezone (Asia/Kolkata)
        const options = { timeZone: 'Asia/Kolkata' };
        const now = new Date();

        // Get the IST date/time string
        const istDateString = now.toLocaleString('en-US', options);

        return new Date(istDateString);
    };

    const [chennaiDate, setChennaiDate] = useState(getChennaiDate);

    useEffect(() => {
        // Update every second for live time
        const timer = setInterval(() => {
            setChennaiDate(getChennaiDate());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Format helpers
    const formatTime = (options = {}) => {
        const defaultOptions = {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            ...options
        };
        return new Date().toLocaleTimeString('en-US', defaultOptions);
    };

    const formatDate = (options = {}) => {
        const defaultOptions = {
            timeZone: 'Asia/Kolkata',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            ...options
        };
        return new Date().toLocaleDateString('en-US', defaultOptions);
    };

    const getDay = () => {
        return new Date().toLocaleDateString('en-US', {
            timeZone: 'Asia/Kolkata',
            weekday: 'long'
        });
    };

    const getShortDate = () => {
        return new Date().toLocaleDateString('en-US', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const getISODate = () => {
        // Returns YYYY-MM-DD format in IST
        const options = { timeZone: 'Asia/Kolkata' };
        const date = new Date();
        const year = date.toLocaleDateString('en-CA', { ...options, year: 'numeric' }).slice(0, 4);
        const month = date.toLocaleDateString('en-CA', { ...options, month: '2-digit' }).slice(0, 2);
        const day = date.toLocaleDateString('en-CA', { ...options, day: '2-digit' }).slice(0, 2);

        return `${year}-${month}-${day}`;
    };

    const getDayOfWeek = () => {
        // Returns 0-6 (Sunday-Saturday) in IST
        return getChennaiDate().getDay();
    };

    return {
        chennaiDate,
        formatTime,
        formatDate,
        getDay,
        getShortDate,
        getISODate,
        getDayOfWeek,
        // Raw time string (updates every second)
        time: formatTime(),
        // Full date string
        date: formatDate(),
        // Day name
        dayName: getDay(),
        // ISO date string (YYYY-MM-DD)
        isoDate: getISODate()
    };
};

export default useChennaiTime;
