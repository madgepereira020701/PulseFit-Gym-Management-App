import React, { useState, useEffect } from "react";
import { FaTrashAlt } from 'react-icons/fa';  // Import the trash icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import './EmCalendar.css';

const EmCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState({}); // Store events with date and time
  const [selectedDay, setSelectedDay] = useState(null);
  const [newEvent, setNewEvent] = useState("");
  const [view, setView] = useState("month"); // State to track the current view (month, week, agenda)
  const [selectedSlot, setSelectedSlot] = useState(null); // For week view time slots
  
  const navigate = useNavigate();
  


  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem('token');  // Get token from localStorage
      if (!token) {
        console.log('No token found');
        return;
      }
    
      try {
        const response = await fetch('http://localhost:3000/eventsforemployees', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        const data = await response.json();
        console.log('API Response:', data);  // Log the full response
        
    
        if (data.status === 'SUCCESS') {
          const formattedEvents = {};
          data.events.forEach(event => {
            const { eventDate, eventName } = event;
            const formattedDate = new Date(eventDate).toISOString().split('T')[0]; // 'YYYY-MM-DD'
            formattedEvents[formattedDate] = [
              ...(formattedEvents[formattedDate] || []),
              eventName
            ];
          });
          
          console.log('Formatted Events:', formattedEvents);  // Log the formatted events
          setEvents(formattedEvents); // Store in state
        } else {
          console.log('API status is not SUCCESS:', data);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    
    fetchEvents();
  }, []); // Runs once when component mounts

  


  const getMonthName = (monthIndex) => {
    const months = [
      "January", "February", "March", "April", "May", 
      "June", "July", "August", "September", "October", 
      "November", "December"
    ];
    return months[monthIndex];
  };

  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get days for the week view
  const daysInWeek = (startOfWeek) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + direction,
      1
    );
    setCurrentDate(newDate);
  };

  const handleTodayClick = () => {
    setCurrentDate(new Date()); // Reset to today's date
    setSelectedDay(new Date().getDate()); // Set today's date as selected
  };

  const handleAddEvent1 = () => {
    if (newEvent.trim() && selectedSlot) {
      const eventKey = `${selectedSlot.date}-${selectedSlot.time}`; // Use both date and time
      setEvents((prevEvents) => ({
        ...prevEvents,
        [eventKey]: [...(prevEvents[eventKey] || []), newEvent], // Store events at the specific time slot
      }));
      setNewEvent(""); // Clear input after adding event
      setSelectedSlot(null); // Close the form
    }
  };


  const handleAddEvent = async () => {
    if (!selectedDay || !newEvent.trim()) {
      alert('Please select a date and enter an event description!');
      return;
    }
  
    const eventDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}`;
    const eventData = {
      eventDate: eventDate,
      eventName: newEvent.trim(),
    };
  
    // Update events locally (frontend state)
    setEvents((prevEvents) => ({
      ...prevEvents,
      [eventDate]: [...(prevEvents[eventDate] || []), newEvent.trim()],
    }));
  
    setNewEvent(""); // Clear input after adding event
    setSelectedDay(null); // Close the form
  
    const token = localStorage.getItem('token');  // Get token from localStorage
    if (!token) {
      console.log('No token found');
      return;
    }
  
    // Send event data to the backend
    try {
      const response = await fetch('http://localhost:3000/addevent', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json', // Ensure backend recognizes JSON
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
    const handleDeleteEvent = (eventIndex) => {
    const eventKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}`;
    setEvents((prevEvents) => {
      const updatedEvents = prevEvents[eventKey].filter((_, index) => index !== eventIndex);
      if (updatedEvents.length > 0) {
        return { ...prevEvents, [eventKey]: updatedEvents };
      } else {
        const { [eventKey]: deleted, ...rest } = prevEvents; // Remove the day if no events left
        return rest;
      }
    });
    setSelectedDay(null); // Close the form after deleting
  };

  const handleDeleteSlotEvent = (eventIndex) => {
    if (selectedSlot) {
      const eventKey = `${selectedSlot.date}-${selectedSlot.time}`;
      setEvents((prevEvents) => {
        const updatedEvents = prevEvents[eventKey].filter((_, index) => index !== eventIndex);
        if (updatedEvents.length > 0) {
          return { ...prevEvents, [eventKey]: updatedEvents };
        } else {
          const { [eventKey]: deleted, ...rest } = prevEvents; // Remove the slot if no events are left
          return rest;
        }
      });
      setSelectedSlot(null); // Close the form after deleting
    }
  };


  const handleClick = () => {
    navigate('/year'); // Redirect to the Members page when button is clicked
  };
  
  
  const renderMonthView = () => {
    const days = [];
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const totalDays = daysInMonth(currentDate.getMonth(), currentDate.getFullYear());
  
    // Render empty days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<td className="empty" key={`empty-${i}`} />);
    }
  
    // Render the actual days of the month
    for (let i = 1; i <= totalDays; i++) {
      const eventDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${i}`;
      const isToday = new Date().getDate() === i && new Date().getMonth() === currentDate.getMonth();
      days.push(
        <td 
          className={`day ${isToday ? 'today' : ''}`} 
          key={i} 
          onClick={() => setSelectedDay(i)}
          draggable
          onDragStart={(e) => {
            // Set dragged event information
            e.dataTransfer.setData("event", eventDate);
          }}
          onDrop={(e) => {
            e.preventDefault();
            // Handle drop event
            const draggedEvent = e.dataTransfer.getData("event");
            const targetDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${i}`;
            if (draggedEvent !== targetDate) {
              // Move event to the new target date
              setEvents((prevEvents) => {
                const newEvents = { ...prevEvents };
                const event = prevEvents[draggedEvent] && prevEvents[draggedEvent][0]; // Get first event from the dragged date
                if (event) {
                  // Remove event from the dragged date
                  newEvents[draggedEvent] = newEvents[draggedEvent].filter(ev => ev !== event);

                  // Add event to the new date
                  newEvents[targetDate] = [...(newEvents[targetDate] || []), event];
                }
                return newEvents;
              });
            }
          }}
          onDragOver={(e) => {
            e.preventDefault(); // Allow the drop
          }}
        >
          <span>{i}</span>
          {/* Display event names inside separate bars */}
          {events[eventDate] && (
            <div
              className="event-bar"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("event", eventDate);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const draggedEvent = e.dataTransfer.getData("event");
                const targetDate = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${i}`;
                if (draggedEvent !== targetDate) {
                  setEvents((prevEvents) => {
                    const newEvents = { ...prevEvents };
                    const event = prevEvents[draggedEvent] && prevEvents[draggedEvent][0];
                    if (event) {
                      newEvents[targetDate] = [...(newEvents[targetDate] || []), event];
                    }
                    return newEvents;
                  });
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
              }}
            >
              {events[eventDate].map((event, index) => (
                <div key={index} className="event-name">{event}</div>
              ))}
            </div>
          )}
        </td>
      );
    }
  
    // Fill the rest of the week (if necessary)
    const totalCells = days.length + (7 - (days.length % 7)) % 7;
    const rows = [];
    for (let i = 0; i < totalCells; i += 7) {
      rows.push(
        <tr key={`row-${i}`}>
          {days.slice(i, i + 7)}
        </tr>
      );
    }
  
    return rows;
  };
  

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDays = daysInWeek(startOfWeek);
  
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      const formattedTime = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour < 12 ? "AM" : "PM"}`;
      timeSlots.push(formattedTime);
    }
  
    const handleDragStart = (e, eventKey) => {
      e.dataTransfer.setData("eventKey", eventKey);  // Store the event's unique key (date-time)
    };
  
    const handleDrop = (e, targetDate, targetTime) => {
      e.preventDefault();
      const draggedEventKey = e.dataTransfer.getData("eventKey");  // Get the dragged event's unique key
      if (draggedEventKey) {
        const draggedEvent = events[draggedEventKey][0];  // Get the event from the dragged key
        if (draggedEvent) {
          // Add the event to the new target date-time slot
          setEvents((prevEvents) => {
            const newEvents = { ...prevEvents };
            if (!newEvents[`${targetDate}-${targetTime}`]) {
              newEvents[`${targetDate}-${targetTime}`] = [];
            }
            newEvents[`${targetDate}-${targetTime}`].push(draggedEvent);
  
            // Remove the event from the original slot
            const updatedEvents = prevEvents[draggedEventKey].filter(
              (event) => event !== draggedEvent
            );
            if (updatedEvents.length > 0) {
              newEvents[draggedEventKey] = updatedEvents;
            } else {
              const { [draggedEventKey]: deleted, ...rest } = newEvents;
              return rest;
            }
            return newEvents;
          });
        }
      }
    };
  
    return (
      <div>
        <table className="week-view-table">
          <thead>
            <tr>
              <th>Time</th>
              {weekDays.map((day) => {
                const isToday = day.getDate() === new Date().getDate() && day.getMonth() === new Date().getMonth();
                return (
                  <th key={day} className={isToday ? "current-day" : ""}>
                    {day.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Extra row above 12:00 AM */}
            <tr>
              <td>Whole Day</td>
              {weekDays.map((day, index) => {
                const date = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
                return (
                  <td key={index} className="extra-row">
                    {/* Display events for the day in the extra row */}
                    {events[date] && events[date].map((event, idx) => (
                      <div key={idx} className="event-name">{event}</div>
                    ))}
                  </td>
                );
              })}
            </tr>
  
            {timeSlots.map((time, index) => (
              <tr key={index}>
                <td>{time}</td>
                {weekDays.map((day) => {
                  const date = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
                  const eventKey = `${date}-${time}`;
                  const isSelected = selectedSlot && selectedSlot.date === date && selectedSlot.time === time;
  
                  return (
                    <td
                      key={eventKey}
                      className={`time-slot ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedSlot(isSelected ? null : { date, time });
                      }}
                      onDrop={(e) => handleDrop(e, date, time)}  // Handle drop on time slot
                      onDragOver={(e) => e.preventDefault()}  // Allow drop
                    >
                      {/* Event bars inside time slots */}
                      {events[eventKey] &&
                        events[eventKey].map((event, idx) => (
                          <div
                            key={idx}
                            className="event-bar"
                            draggable
                            onDragStart={(e) => handleDragStart(e, eventKey)}  // Start drag for the event
                          >
                            <div className="event-name">{event}</div>
                          </div>
                        ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const renderAgendaView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }
  
    // Create a list of time slots, but only include those with events.
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
      const formattedTime = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}:00 ${hour < 12 ? "AM" : "PM"}`;
      
      // Check if any events exist for this time slot on any day
      const hasEvents = weekDates.some(day => {
        const date = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
        const eventKey = `${date}-${formattedTime}`;
        return events[eventKey] && events[eventKey].length > 0;
      });
  
      // If events exist for this time slot, include it in the list
      if (hasEvents) {
        timeSlots.push(formattedTime);
      }
    }
  
    return (
      <div>
        <table className="agenda-table">
          <thead>
            <tr>
              <th>Time</th>
              {weekDates.map((day, index) => (
                <th key={index}>
                  {day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
          <tr>
              <td>Whole Day</td>
              {weekDates.map((day, index) => {
                const date = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
                return (
                  <td key={index} className="extra-row">
                    {/* Display events for the day in the extra row */}
                    {events[date] && events[date].map((event, idx) => (
                      <div key={idx} className="event-name">{event}</div>
                    ))}
                  </td>
                );
              })}
            </tr>
            {timeSlots.map((time, index) => (
              <tr key={index}>
                <td>{time}</td>
                {weekDates.map((day, dayIndex) => {
                  const date = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
                  const eventKey = `${date}-${time}`;
                  const eventsForTime = events[eventKey] || [];
  
                  return (
                    <td key={dayIndex}>
                      {eventsForTime.length > 0 ? (
                        <div className="events-list">
                          {eventsForTime.map((event, idx) => (
                            <div key={idx} className="event-name">
                              {event}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span></span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


  const handleViewChange = (viewType) => {
    setView(viewType);
  };

  return (
    <div className="calendar-container">
      <div className="view-buttons">
        <div>
          <button className="btn1" onClick={() => changeMonth(-1)}>{"Back"}</button>
          <button className="btn1" onClick={() => changeMonth(1)}>{"Next"}</button>
          <button className="btn1" onClick={handleTodayClick}>Today</button>
        </div>
        <span className="span1"><h2>
          {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
        </h2>
        </span>
        <span className="span2">
          <button className="btn1" onClick={() => handleViewChange("month")}>Month</button>
          <button className="btn1" onClick={() => handleViewChange("week")}>Week</button>
          <button className="btn1" onClick={() => handleViewChange("agenda")}>Agenda</button>

          <button className="btn1" onClick={handleClick}>Year</button>

        </span>
      </div>

      <div className="calendar-view">
  <div>
    {view === "month" && (
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
    )}
    {view === "month" && renderMonthView()}
  </div>
  <div>
    {view === "week" && renderWeekView()}
    {/* {view === "year" && renderYearView()} */}

    {view === "agenda" && renderAgendaView()}
  </div>
</div>


      {selectedSlot && (
        <div className="event-form">
          <h3>
            Events for {selectedSlot.date} at {selectedSlot.time}
          </h3>
          <textarea
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="Enter event description"
          />
          <div className="button-group">
            <button className="add" onClick={handleAddEvent1}>Add Event</button>
            <button className="cancel" onClick={() => setSelectedSlot(null)}>Cancel</button>
          </div>

          {/* Display and delete existing events */}
          {events[`${selectedSlot.date}-${selectedSlot.time}`] && (
  <div className="existing-events">
    <h4>Existing Events:</h4>
    <ul>
      {events[`${selectedSlot.date}-${selectedSlot.time}`].map((event, index) => (
        <li key={index} className="event-item">
          <button 
            onClick={() => handleDeleteSlotEvent(index)} 
            className="delete-btn"
            aria-label="Delete event"
          >
            <FaTrashAlt /> {/* React Icon bin icon */}
          </button>
          <span className="event">{event}</span>
        </li>
      ))}
    </ul>
  </div>
)}
        </div>
      )}

      {selectedDay && (
        <div className="event-form">
          <h3>
            Events for {selectedDay}{" "}
            {getMonthName(currentDate.getMonth())}{" "}
            {currentDate.getFullYear()}
          </h3>
          <textarea
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="Enter event description"
          />
          <div className="button-group">
            <button className="add" onClick={handleAddEvent}>Add Event</button>
            <button className="cancel" onClick={() => setSelectedDay(null)}>Cancel</button>
          </div>

          {/* Display and delete existing events */}
          {events[`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}`] && (
            <div className="existing-events">
              <h4>Existing Events:</h4>
              <ul>
                {events[`${currentDate.getFullYear()}-${currentDate.getMonth() + 1}-${selectedDay}`].map((event, index) => (
                 <li key={index} className="event-item">
                 <button 
                   onClick={() => handleDeleteEvent(index)} 
                   className="delete-btn"
                   aria-label="Delete event"
                 >
                   <FaTrashAlt /> {/* React Icon bin icon */}
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

export default EmCalendar; 