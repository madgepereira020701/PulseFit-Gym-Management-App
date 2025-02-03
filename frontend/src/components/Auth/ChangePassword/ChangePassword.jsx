import React, { useState } from 'react';
import { API } from '../../service/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const passwordValues = {
    newpassword: '',
    confirmpassword: '',
};

const ChangePassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [confirm, setConfirm] = useState(passwordValues);
    const [warnings, setWarnings] = useState({});
    const [error, setError] = useState('');
    const [ searchParams ] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validatePassword = (password) => password.length >= 6;

    const validateFields = (field, value) => {
        const newWarnings = { ...warnings };
        if (field === 'newpassword' && !validatePassword(value)) {
            newWarnings.newpassword = 'Password must be at least 6 characters long.';
        } else if (field === 'confirmpassword' && value !== confirm.newpassword) {
            newWarnings.confirmpassword = 'Passwords do not match.';
        } else {
            delete newWarnings[field];
        }
        setWarnings(newWarnings);
    };

    const onValueChange = (e) => {
        setConfirm({ ...confirm, [e.target.name]: e.target.value.trim() });
        validateFields(e.target.name, e.target.value.trim());
    };

    const updatePassword = async () => {
        if (!confirm.newpassword || !confirm.confirmpassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (Object.keys(warnings).length > 0) {
            setError('Please resolve all validation warnings.');
            return;
        }

        console.log("Token in ChangePassword:", token); // <--- Add this line

        try {
            const response = await API.updatePassword(token,confirm);
            if (response) {
                alert('Password updated successfully, redirecting to login page...');
                console.log('Password updated successfully, redirecting to login page...');
                navigate('/');
            } else {
                setError('Something went wrong, try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again later.');
            console.error('Error in updatePassword:', err);
        }
    };

    return (
        <div className="auth-container">
            <div className="form-container">
                <h2>Confirm Password</h2>

                <div className="password-container">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        onChange={onValueChange}
                        name="newpassword"
                        placeholder="New Password"
                        className="input-field"
                    />
                    <span className="material-icons show-hide" onClick={togglePasswordVisibility}>
                        {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                </div>
                <div className="password-container">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        onChange={onValueChange}
                        name="confirmpassword"
                        placeholder="Confirm Password"
                        className="input-field"
                    />
                    <span className="material-icons show-hide" onClick={togglePasswordVisibility}>
                        {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                </div>
                {warnings.confirmpassword && <p className="warning-message">{warnings.confirmpassword}</p>}
                {error && <p className="error-message">{error}</p>}
                <button className="dark-button" onClick={updatePassword}>Confirm</button>
            </div>
        </div>
    );
};

export default ChangePassword;
