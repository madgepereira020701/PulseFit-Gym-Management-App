import React, { useState, useEffect } from "react";
import "./AddRenewal.css";
import { useNavigate, useParams } from "react-router-dom";

const AddRenewal = () => {
  const [errors, setErrors] = useState({});
  const [plans, setPlans] = useState([]); 
  const [packageData, setPackageData] = useState([{ plan:'', price:'', doj:'', doe:''}])
  const [status, setStatus] = useState("Submit");
  const [loading, setLoading] = useState(true);
  const { memno } = useParams();
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token'); 
      if (!token) {
        console.log('No token found');
        return;
      }
      
      try {
        setLoading(true);
        console.log("Fetching members and plans...");

        const plansResponse = await fetch("http://localhost:3000/addplans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const plansData = await plansResponse.json();
        setPlans(plansData);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert(`Error fetching data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateFields = () => {
 
      if(!packageData.plan || !packageData.price || !packageData.doj || !packageData.doe) {
        return "Please fill in all required fields.";
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    // Validate form data
    const errorMessage = validateFields();
    if (errorMessage) {
      setStatus("Submit");
      return;
    }

    setErrors({}); // Clear errors if all fields are valid

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

    setStatus("Submit");
  };

    const handlePackageChange = (field, value) => {
      setPackageData((prevData) => {
        const newData = {...prevData,[field]: value};

        if (field === 'plan') {
            const selectedPlan = plans.find((plan) => plan.planname === value);
            if (selectedPlan) {
              const validityInMonths = selectedPlan.validity;
              newData.price = selectedPlan.amount.toString();
              newData.plan = selectedPlan.planname;


              if(prevData.doj) {
                const startDate = new Date(prevData.doj);
                const endDate = new Date(startDate);
                endDate.setMonth(startDate.getMonth() + validityInMonths);
                newData.doe = endDate.toISOString().split('T')[0];
              }
            }
              else {
                newData.price = '';
                newData.doe = '';
              }
          }

        if(field === 'doj') {
          const selectedPlan = plans.find((plan) => plan.planname === prevData.plan);
          if (selectedPlan) {
          const validityInMonths = selectedPlan.validity;
          const startDate = new Date(value);
          const endDate = new Date(startDate);
          endDate.setMonth(startDate.getMonth() + validityInMonths);
          newData.doe = endDate.toISOString().split('T')[0];
        } else {
          newData.doe = '';
        }
      }

      return newData;

      });

    }
  
  
          
 

  const handleCancel = () => {
  setPackageData([{doj: "",
    doe: "",
    price: "",
    plan: "",}]);
    setErrors({});
  };

  if (loading) {
    return <p>Loading members and plans...</p>;
  }


  
  return (
    <div className="auth-container">

      <div className="form-container">
        <h2>Add Renewal</h2>
        <form onSubmit={handleSubmit}>
          {errors.message && (
            <div className="warning-message">
              <p style={{ color: "red" }}>{errors.message}</p>
            </div>
          )}

          <div className="input-group">
          <div>
          <label>Plan</label>
          <select
            name="plan"
            className="input-field3"
            value={packageData.plan}
            onChange={(e) => handlePackageChange('plan', e.target.value) }

          >
            <option value="">Select a Plan</option>
            {plans.map((plan, i) => (
              <option key={i} value={plan.planname}>
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
            placeholder="Price"
            className="input-field3"
            value={packageData.price}
            onChange={(e) => handlePackageChange('price',e.target.value)}
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
                className="input-field3"
                value={packageData.doj}
                onChange={(e) => handlePackageChange('doj', e.target.value)}
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                name="doe"
                className="input-field3"
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
