import React, { useState } from 'react';
import './Settings.css';

const Settings = () => {
    const [formData, setFormData] = useState({
        sendToMembers: false,
        sendToEmployees: false,
    });

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setFormData({
            ...formData,
            [name]: checked,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form Data Submitted:', formData);

        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found');
            return;
        }

        // Send data to backend (POST request)
        try {
            const response = await fetch('http://localhost:3000/updateSettings', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,  // Add token in Authorization header
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sendToMembers: formData.sendToMembers,
                    sendToEmployees: formData.sendToEmployees,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(`Settings updated!\nSend to Members: ${formData.sendToMembers}\nSend to Employees: ${formData.sendToEmployees}`);
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('There was an error submitting the form.');
        }
    };

    return (
        <div className='auth-container'>
            <div className='form-container'>
                <h2>Select Recipients</h2>
                <label>
                    <input
                        type="checkbox"
                        name="sendToMembers"
                        checked={formData.sendToMembers}
                        onChange={handleChange}
                    />
                    Send to Members
                </label>
                <br />
                <label>
                    <input
                        type="checkbox"
                        name="sendToEmployees"
                        checked={formData.sendToEmployees}
                        onChange={handleChange}
                    />
                    Send to Employees
                </label>
                <br />
                <button className="settings-button"onClick={handleSubmit}>Submit</button>
            </div>
        </div>
    );
};

export default Settings;
