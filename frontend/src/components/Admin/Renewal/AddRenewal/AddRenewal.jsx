import React, { useState, useEffect, useCallback } from "react";
import "./AddRenewal.css";
import { useNavigate, useParams } from "react-router-dom";
import moment from 'moment';

const AddRenewal = () => {
    const [plans, setPlans] = useState([]); 
    const { memno, plan: initialPlan } = useParams();
    const [packageData, setPackageData] = useState({ plan: initialPlan || '', price:'', doj:'', doe:''})
    const [status, setStatus] = useState("Submit");
    const navigate = useNavigate();
  
  const calculateDoe = useCallback((planName, doj) => {
    const plan = plans.find((p) => p.planname === planName);
    if(!plan || !doj)  return '';
    const startDate = moment(doj);
    const endDate =  moment(startDate).add(plan.validity, 'months');
    return endDate.format('YYYY-MM-DD');
  }, [plans]);

    useEffect(() => {
      const fetchData = async () => {
        const token = localStorage.getItem('token'); 
        if (!token) {
          console.log('No token found');
          return;
        }
        
        try {
  
          const plansResponse = await fetch("http://localhost:3000/addplans", {
            headers: { Authorization: `Bearer ${token}` },                });
            const plansData = await plansResponse.json();
            setPlans(plansData);

          const packagesResponse = await fetch(`http://localhost:3000/renewals/${memno}/${initialPlan}`, {
            headers: { Authorization: `Bearer ${token}`}
          })

          if(!packagesResponse.ok) {
            const errorDate = await packagesResponse.json();
            throw new Error(errorDate.message || "Failed to fetch data");
          }

          const packagesData = await packagesResponse.json();
          if(initialPlan) {
            const foundPlan = plansData.find((plan) => plan.planname === initialPlan);
            if(packagesData && foundPlan) {
              setPackageData({
                plan: initialPlan,
                price: foundPlan ? foundPlan.amount.toString() : "",
                doj: packagesData.data.doe,
                doe: calculateDoe(initialPlan, packagesData.data.doe)
              });
            } else {
              setPackageData({
                plan: initialPlan,
                price: foundPlan ? foundPlan.amount.toString() : "",
              });

            }
            }
          }
           catch (error) {
            console.error("Error fetching data:", error);
            alert(`Error fetching data: ${error.message}`);
          }       
        };

          fetchData();
        }, [initialPlan, memno, calculateDoe, plans, navigate]);
            
        const handleSubmit = async (e) => {
          e.preventDefault();
          setStatus("Sending...");
              
          const token = localStorage.getItem('token');
          
          if (!token) {
            console.log('No token found');
            return;
          }
      
          const formData = {
            packages: {
                plan: packageData.plan,
                price: parseFloat(packageData.price),
                doj: packageData.doj,
                doe: packageData.doe
            }
        };
         
          try {
            const response = await fetch(`http://localhost:3000/renewals/${memno}`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json", // Make sure we send JSON content
              },
              body: JSON.stringify(formData), // Send form data as the request body
            });
      
            const result = await response.json();
            alert(result.status); // Show success message or handle error from backend
            navigate(`/payments/${memno}`)
          } catch (error) {
            console.error("Error submitting form:", error);
            alert("An error occurred. Please try again.");
          }
          finally {
          setStatus("Submit");
        };
      }
      



    const handleCancel = () => {
        setPackageData([{doj: "",
          doe: "",
          price: "",
          plan: "",}]);
        };



          return (
            <div className="auth-container">
        
        <div className="form-container">
        <h2>Add Renewal</h2>
        <form onSubmit={handleSubmit}>

<div className="input-group">
          <div>
          <label>Plan</label>
          <input
            name="plan"
            className="input-field2"
            value={packageData.plan}
            readOnly
          />
          </div>

          <div>
          <label>Price</label>
          <input
            type="number"
            name="price"
            placeholder="Price"
            className="input-field2"
            value={packageData.price}
            onChange={(e) => setPackageData({...packageData, price: e.target.value })}
          />
          </div>
          <br /><br />
          </div>


          <div className="input-group">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                name="doj"
                className="input-field2"
                value={packageData.doj}
                onChange={(e) => setPackageData({ ...packageData, doj: e.target.value, doe: calculateDoe(packageData.plan, e.target.value) })}
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                name="doe"
                className="input-field2"
                value={packageData.doe}
                readOnly
              />

</div>
</div>
          
          <br />


          <div className="button-group">
            <button type="submit" className="add">
              {status}
            </button>
            <button type="button" className="cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddRenewal;

