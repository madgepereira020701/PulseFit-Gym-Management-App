import React, {useState, useEffect } from 'react';
import './AddMorePlans.css';
import { useNavigate, useParams } from 'react-router-dom';

const AddMorePlans = () => {
    const [packages, setPackages] = useState([{plan:'', price:'', doj:'', doe:''}])
    const [plans, setPlans] = useState([]);
    const [error, setError] = useState('');
    const { memno } = useParams();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchPlans = async () => {
            const token = localStorage.getItem('token');
            if(!token) {
                console.error('No token found');
                return;
            }
            try{
                const response = await fetch('http://localhost:3000/addplans', {
                   headers: {
                    Authorization: `Bearer ${token}`,
                   },
                });
                const data = await response.json();
                if(!response.ok) {
                    throw new Error(data.message || 'Failed to fetch plans');
                }
                setPlans(data);
            } catch (err) {
                console.error('Error fetching plans:', err.message);
            }
        };

        fetchPlans();
    }, []);

   


    const addPlanHandler = async () => 
    {
        for(const packageItem of packages){
            if(!packageItem.plan || !packageItem.price || !packageItem.doj || !packageItem.doe){
                setError('Please resolve all validation warnings. ');
                return;
            }
        }

            const token = localStorage.getItem('token');
            if(!token) {
                console.error('No token found');
                return;
            }

            const formData = {
                packages: packages.map((pkg) => ({
                    plan: pkg.plan,
                    price: parseFloat(pkg.price),
                    doj: pkg.doj,
                    doe: pkg.doe
                }))
            };

            try {
                const response = await fetch(`http://localhost:3000/addplans/${memno}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                     Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(formData),
                 });

                 const data = await response.json();
                 if(!response.ok) {
                    throw new Error(data.message || 'Failed to add plan');
                 }

                 alert('Plan added successfully!');
                 setPackages([{plan:'', price:'', doj:'', doe:''}]);
                 setError('');
                 navigate(`/payments/${memno}`)
                } catch (err){
                    console.error('Error adding plan:', err.message);
                    setError(err.message || 'There was an error in submitting the form.');
                }
        };


        const addPackage = () => {
            setPackages([...packages, {plan:'', price:'', doj:'', doe:'' }]);
        }

        const removePackage = (index) => {
            const updatedPackages = packages.filter((_,i) => i!== index);
            setPackages(updatedPackages);
        }

        const handlePackageChange = (index, field, value) => {
            setPackages((prevPackages) => {
                const updatedPackages = [...prevPackages];
                updatedPackages[index][field] = value;
                if(field === 'plan') {
                    const selectedPlan = plans.find((plan) => plan.planname === value);
                    if(selectedPlan) {
                        const validityInMonths = selectedPlan.validity;
                        updatedPackages[index].price = selectedPlan.amount.toString();
                        updatedPackages[index].plan = selectedPlan.planname;
                        if(updatedPackages[index].doj) {
                            const startDate = new Date(updatedPackages[index].doj);
                            const endDate = new Date(startDate);
                            endDate.setMonth(startDate.getMonth() + validityInMonths);
                            updatedPackages[index].doe = endDate.toISOString().split('T')[0];
                        }
                    }  else {
                        updatedPackages[index].price = '';
                        updatedPackages[index].doe = '';
                    }
                }

                if(field === 'doj') {
                    const selectedPlan = plans.find((plan) => plan.planname === updatedPackages[index].plan);
                    if(selectedPlan) {
                        const validityInMonths = selectedPlan.validity;
                        const startDate = new Date(value);
                        const endDate = new Date(startDate);
                        endDate.setMonth(startDate.getMonth() + validityInMonths);
                        updatedPackages[index].doe = endDate.toISOString().split('T')[0];
                    } else {
                        updatedPackages[index].doe = '';
                    }
                }
                return updatedPackages;
            });
        }

        return(
           <div className="auth-container">
            <div className="form-container">
                <h2>Add Plan</h2>
                {packages.map((planrow,index) => (
                    <div key={index}>
                        <div className="input-group">
                            <div>
                                <label>Plan</label>
                                <select 
                                 name="plan"
                                 className='input-field2'
                                 value={planrow.plan}
                                 onChange={(e) => handlePackageChange(index,'plan', e.target.value)}>
                                    <option value="">Select a Plan</option>
                                    {plans.map((plan,index) => (
                                        <option key={index} value={plan.planname}>
                                            {plan.planname}
                                        </option>
                                    ))}
                                 </select>
                            </div>

                            <div>
                                <label>Price</label>
                                <input 
                                  type="number"
                                  name="price"
                                  placeholder='Price'
                                  className='input-field2'
                                  value={planrow.price}
                                  onChange={(e) => handlePackageChange(index,'price',e.target.value)} />
                            </div>
                        </div>

                            <div className="input-group">
                            <div>
                            <label>Start Date</label>
                            <input 
                             type="date"
                             name="doj"
                             placeholder='Start Date'
                             className='input-field2'
                             value={planrow.doj}
                             onChange={(e) => handlePackageChange(index,'doj',e.target.value)} />
                            </div>

                            <div>
                            <label>End Date</label>
                            <input 
                             type="date"
                             name="doe"
                             placeholder='End Date'
                             className='input-field2'
                             value={planrow.doe}
                             />
                            </div>
                        </div>
                        {index > 0 && (
                            <button type="button" className="cancel" onClick={() => removePackage(index)}>-</button>
                        )}
                                
                    </div>                      
                ))}
                <button type="button" className="add" onClick={addPackage}>Add</button>
                                <br />
                        {error && <p className='error-message'>{error}</p>}
                        <div className='button-group'>
                        <button className="cancel">Cancel</button>
                        <button className="add" onClick={addPlanHandler}>Add</button>
                        </div>
            </div>
           </div> 
        );

        };
    export default AddMorePlans;

 
