import React, { useState, useEffect, useRef } from 'react';
import type { ScheduleItem } from '../types';
import Loader from './Loader';
import CalendarIcon from './icons/CalendarIcon';
import BellIcon from './icons/BellIcon';
import BellIconFilled from './icons/BellIconFilled';

interface UpcomingShowsProps {
  shows: ScheduleItem[];
  isLoading: boolean;
}

const UpcomingShows: React.FC<UpcomingShowsProps> = ({ shows, isLoading }) => {
  const [reminders, setReminders] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('etnfm-reminders');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.error("Failed to parse reminders from localStorage", error);
      return new Set();
    }
  });
  const timeoutRefs = useRef<Record<number, number>>({});

  const scheduleNotification = (show: ScheduleItem) => {
    const now = Date.now();
    const startTime = new Date(show.start).getTime();
    const FIVE_MINUTES_IN_MS = 5 * 60 * 1000;
    
    // Notify 5 minutes before the show starts
    const notificationTime = startTime - FIVE_MINUTES_IN_MS;
    const delay = notificationTime - now;

    if (delay > 0) {
      const timeoutId = window.setTimeout(() => {
        new Notification('ETN FM Show Reminder', {
          body: `${show.title} is starting in 5 minutes.`,
          icon: '/favicon.ico', // You can replace this with a proper icon URL
        });
        // Clean up reminder after it fires
        setReminders(prev => {
          const newReminders = new Set(prev);
          newReminders.delete(show.id);
          localStorage.setItem('etnfm-reminders', JSON.stringify(Array.from(newReminders)));
          return newReminders;
        });
      }, delay);
      timeoutRefs.current[show.id] = timeoutId;
    }
  };

  const cancelNotification = (showId: number) => {
    if (timeoutRefs.current[showId]) {
      clearTimeout(timeoutRefs.current[showId]);
      delete timeoutRefs.current[showId];
    }
  };

  const handleToggleReminder = async (show: ScheduleItem) => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications.');
      return;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'denied') {
      alert('Notification permission was denied. Please enable it in your browser settings to use this feature.');
      return;
    }

    if (permission === 'granted') {
      setReminders(prev => {
        const newReminders = new Set(prev);
        if (newReminders.has(show.id)) {
          newReminders.delete(show.id);
          cancelNotification(show.id);
        } else {
          newReminders.add(show.id);
          scheduleNotification(show);
        }
        localStorage.setItem('etnfm-reminders', JSON.stringify(Array.from(newReminders)));
        return newReminders;
      });
    }
  };

  useEffect(() => {
    // Schedule notifications for any reminders loaded from storage
    shows.forEach(show => {
      if (reminders.has(show.id)) {
        // Clear any existing timeout before setting a new one to avoid duplicates
        cancelNotification(show.id);
        scheduleNotification(show);
      }
    });

    // Cleanup all timeouts on component unmount
    return () => {
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, [shows, reminders]);


  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-md">
      <h2 className="text-xl font-bold text-gray-300 mb-4 text-center">Upcoming Shows</h2>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : shows.length > 0 ? (
          shows.map((show) => (
            <div key={show.id} className="flex items-center bg-white/5 hover:bg-white/10 p-3 rounded-lg transition-colors duration-200 group">
              <div className="flex-shrink-0 w-16 text-center mr-4">
                <p className="font-bold text-blue-400 text-lg">{formatTime(show.start)}</p>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold text-white truncate">{show.title}</p>
              </div>
              <button 
                onClick={() => handleToggleReminder(show)} 
                className="ml-4 p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                aria-label={reminders.has(show.id) ? 'Cancel reminder' : 'Set reminder'}
                title={reminders.has(show.id) ? 'Cancel reminder' : 'Set reminder'}
              >
                {reminders.has(show.id) ? <BellIconFilled /> : <BellIcon />}
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center text-center text-gray-500 py-8">
            <CalendarIcon />
            <p className="mt-2">No upcoming shows scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingShows;