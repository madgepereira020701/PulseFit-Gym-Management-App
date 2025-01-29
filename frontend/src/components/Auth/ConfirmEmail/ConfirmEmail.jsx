import React, { useState} from 'react';
// import { API } from '../service/api';

const initialValue = {
    email: ''
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const EnterEmail = () => {
    const [ verify , setVerify ] = useState(initialValue);
    const [ warnings, setWarnings] = useState({});
    const [ error , setError ] = useState('');
   
    const onValueChange = (e) => {
       setVerify({ ...verify, [e.target.name]: e.target.value});
       validatField('verify', e.target.name, e.target.value);
    }

    const validatField = (field, value) => {
        const newWarnings = { ...warnings};

        if(field === 'email' && !validateEmail(value)){
            newWarnings.email = 'Please enter a valid email address.';
        }
        else {
            delete newWarnings.email;
        }
        setWarnings(newWarnings);
    }

    const verifyUser = async() => {
        if(!verify.email){
            setError('Email required ');
            return;
        }
        if(Object.keys(warnings).length > 0) {
            setError('Please resolve all validation warnings.');
            return;
        }
    }

    return(
        <div className='auth-container'>
         <div className="form-container">
            <h2>Verify Email</h2>
            <input 
            type="email"
            placeholder='Enter Email'
            name="email"
            onChange={onValueChange}
            className='input-field'
            />
            {warnings.email && <p className='warning-message'>{warnings.email}</p>}
            {error && <p className='error-message'>{error}</p>}
           <button className='dark-button' onClick={verifyUser}>Verify</button>
         </div>
        </div>
    )

}

export default EnterEmail;