import React, { useState, useEffect } from "react";
import { FaTrashAlt } from 'react-icons/fa';
import './Calendar.css';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({}); // Store events with date and time
  const [selectedDay, setSelectedDay] = useState(null);
  const [newEvent, setNewEvent] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/events', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.status === 'SUCCESS') {
          const formattedEvents = {};
          data.events.forEach(event => {
            const { eventDate, eventName } = event;
            const eventDateObj = new Date(eventDate);
            const formattedDate = `${eventDateObj.getFullYear()}-${String(eventDateObj.getMonth() + 1).padStart(2, '0')}-${String(eventDateObj.getDate()).padStart(2, '0')}`;
            formattedEvents[formattedDate] = [
              ...(formattedEvents[formattedDate] || []),
              eventName
            ];
          });
          setEvents(formattedEvents);
        } else {
          console.log('API status is not SUCCESS:', data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, []);

  const getMonthName = (monthIndex) => {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[monthIndex];
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date().getDate());
  };

  const handleAddEvent = async () => {
    if (!selectedDay || !newEvent.trim()) {
      alert('Please select a date and enter an event description!');
      return;
    }

    const formattedDay = String(selectedDay).padStart(2, '0');
    const formattedMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const eventDate = `${currentDate.getFullYear()}-${formattedMonth}-${formattedDay}`;

    if (new Date(eventDate) < new Date().setHours(0, 0, 0, 0)) {
      alert('Cannot add events for past dates.');
      return;
    }

    const eventData = { eventDate, eventName: newEvent.trim() };
    setEvents((prevEvents) => ({
      ...prevEvents,
      [eventDate]: [...(prevEvents[eventDate] || []), newEvent.trim()],
    }));
    setNewEvent("");
    setSelectedDay(null);

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/addevent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();
      if (data.status === 'SUCCESS') {
        alert('Event added successfully!');
      } else {
        alert(data.message || 'Failed to add event.');
      }
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event.');
    }
  };

  const handleDeleteEvent = async (eventIndex) => {
    const eventKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const eventName = events[eventKey][eventIndex];
  
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:3000/events/${eventName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      const data = await response.json();
      if (response.ok) {
        setEvents((prevEvents) => {
          const updatedEvents = prevEvents[eventKey].filter((_, index) => index !== eventIndex);
          if (updatedEvents.length > 0) {
            return { ...prevEvents, [eventKey]: updatedEvents };
          } else {
            const { [eventKey]: _, ...rest } = prevEvents;
            return rest;
          }
        });
        alert('Event deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete event.');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event.');
    }
  };
  

  const renderMonthView = () => {
    const days = [];
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());

    for (let i = 0; i < firstDay; i++) {
      days.push(<td className="empty" key={`empty-${i}`} />);
    }

    for (let i = 1; i <= totalDays; i++) {
      const eventDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isToday = new Date().getDate() === i && new Date().getMonth() === currentDate.getMonth();
      days.push(
        <td
          className={`day ${isToday ? 'today' : ''}`}
          key={i}
          onClick={() => setSelectedDay(i)}
        >
          <span>{i}</span>
          {events[eventDate] && (
            <div className="event-bar">
              {events[eventDate].map((event, index) => (
                <div key={index} className="event-name">{event}</div>
              ))}
            </div>
          )}
        </td>
      );
    }

    const rows = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(<tr key={`row-${i}`}>{days.slice(i, i + 7)}</tr>);
    }

    return rows;
  };

  return (
    <div className="calendar-container">
     <div className="view-buttons">
    <div className="back-next">
      <button className="btn1" onClick={() => changeMonth(-1)}>{"Back"}</button>
      <button className="btn1" onClick={() => changeMonth(1)}>{"Next"}</button>
    </div>
    <span className="span1">
      <h2>
        {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
      </h2>
    </span>
    <span className="span2"></span>
    <div className="back-next">
      <button className="btn1" onClick={handleTodayClick}>Today</button>
    </div>
  </div>

      <div className="calendar-view">
        <table>
          <thead>
            <tr>
              <th>Sun</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th>Sat</th>
            </tr>
          </thead>
          <tbody>
            {renderMonthView()}
          </tbody>
        </table>
      </div>

      {selectedDay && (
        <div className="event-form">
          <h3>Events for {selectedDay} {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}</h3>
          <textarea
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="Enter event description"
          />
          <div className="button-group">
            <button className="add" onClick={handleAddEvent}>Add Event</button>
            <button className="cancel" onClick={() => setSelectedDay(null)}>Cancel</button>
          </div>

          {events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`] && (
            <div className="existing-events">
              <h4>Existing Events:</h4>
              <ul>
                {events[`${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`].map((event, index) => (
                  <li key={index} className="event-item">
                    <button
                      onClick={() => handleDeleteEvent(index)}
                      className="delete-btn"
                      aria-label="Delete event"
                    >
                      <FaTrashAlt />
                    </button>
                    <span className="event">{event}</span>
                  </li> 
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  };
                  
                  export default Calendar;
                  