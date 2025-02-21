import React, { useEffect, useState } from 'react';
import './Departments.css';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            const token = localStorage.getItem('token');
            if(!token) {
                console.log('Token not found');
                return;
            }

            try {
            const response = await fetch('http://localhost:3000/departments', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            console.log(data);
            setDepartments(data);
            } catch (err) {
              setError(err.message);
            }
        };
        fetchDepartments();
    } , []);


    const handleDeleteDepartment = async (department) => {
        const token = localStorage.getItem('token');
        if(!token) {
            console.log('No token found');
            return;
        }

        try {
        const response = await fetch(`http://localhost:3000/departments/${department}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if(!response.ok){
            throw new Error(data.message || 'Failed to delete department');            
        }

        setDepartments(departments.filter((dept) => dept.department !== department));
        alert('Department details deleted successfully');
    } catch (error) {
      setError(error.message);
    }       
    }

    return (
        <div className="table-department-container">
            <h2>Departments List</h2>
            {error && <p className='error-message'>{error}</p>}
            {!error && departments.length === 0 && <p>No departments found.</p>}
            {departments.length > 0 && (
                <table className="department-table">
                    <thead>
                        <tr>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((dept, index) => (
                            <tr key={index}>
                                <td>{dept.department}</td>
                                <td className="actions">
                                    <button className='deptbutton' onClick={() => handleDeleteDepartment(dept.department)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {error && <p className="error-message">{error}</p>}

          
        </div>
    )
}

export default Departments;