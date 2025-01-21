import React, { useState } from 'react';

const passwordValues = {
    newpassword: '',
    confirmpassword: '',
}

const ChangePassword = () => {
    const [ showPassword , setShowPassword ] = useState(false);
    const [ confirm, setConfirm ] = useState(passwordValues);
    const [ warnings, setWarnings ] = useState({});

    

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }
    const validatePassword = (newpassword ) => newpassword.length >=0;
    
    const validateFields = (form,field,value ) => {
        const newWarnings = { ...warnings};
        if(field === 'password' && !validatePassword(value)) {
            newWarnings.newpassword = 'Password must be at least 6 characters long.';
        }
        else if(field === 'password' && !validatePassword(value)) {
            newWarnings.confirmpassword = 'Password must be at least 6 characters long.';
        }
        else {
            delete newWarnings[field];
        }
        setWarnings(newWarnings);
    }
    
    const onValueChange = (e) => {
        setConfirm({...confirm, [e.target.name] : [e.target.value]});
        validateFields('confirm', e.target.name, e.target.value);
    }

    return(
        <div className="auth-container">
            <div className="form-container">
            <h2>Confirm Password</h2>

            <div className="password-container">
                <input type={showPassword ? 'type' : 'password'}
                onChange={onValueChange}
                name="newpassword"
                placeholder='New Password'
                className="input-field"
                />
                <span className="material-icons show-hide" onClick={togglePasswordVisibility}>
              {showPassword ? 'visibility' : 'visibility_off'}
                </span>
            </div>
            <div className="password-container">
                <input type={showPassword ? 'type' : 'password'}
                onChange={onValueChange}
                name="confirmpassword"
                placeholder='Confirm Password'
                className="input-field"
                />
                  <span className="material-icons show-hide" onClick={togglePasswordVisibility}>
                {showPassword ? 'visibility' : 'visibility_off'}
                </span>
            </div>
            <button className="dark-button">Confirm</button>
        </div>
        </div>
    );
}

export default ChangePassword;