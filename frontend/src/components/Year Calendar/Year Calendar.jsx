import React, { useState } from 'react';
import './Year Calender.css';

const Calendar = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const today = new Date();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderYearView = () => {
    const calendar = [];

    for (let month = 0; month < 12; month++) {
      const daysInMonth = getDaysInMonth(month, currentYear);
      const firstDay = new Date(currentYear, month, 1).getDay();
      const days = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
      calendar.push({ month, days });
    }

    return calendar;
  };

  return (
    <div className='calendar-container'>
      <div className="calendar-header">
        <button className="btn2"
        onClick={() => setCurrentYear(currentYear - 1)}>&lt; Prev Year</button>
        <h2>{currentYear}</h2>
        <button className="btn3"
        onClick={() => setCurrentYear(currentYear + 1)}>Next Year &gt;</button>
      </div>

        <div className="calendar-grid">
          {renderYearView().map((monthData, monthIndex) => (
            <div className="month-box" key={monthIndex}>
              <h3 className="month-title">{months[monthData.month]}</h3>
              <div className="days-of-week">
                {daysOfWeek.map((day, index) => (
                  <div key={index} className="day-name">{day}</div>
                ))}
              </div>
              <div className="days">
                {monthData.days.map((day, index) => {
                  const isToday =
                    day === today.getDate() &&
                    monthData.month === today.getMonth() &&
                    currentYear === today.getFullYear();

                  return (
                    <div
                      key={index}
                      className={`day1 ${day ? '' : 'empty'} ${isToday ? 'today' : ''}`}
                    >
                      {day || ''}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
  );
};

export default Calendar;
// 