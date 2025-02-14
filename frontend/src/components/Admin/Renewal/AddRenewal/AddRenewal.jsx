import React, { useState, useEffect } from "react";
import "./AddRenewal.css";
import { useParams } from "react-router-dom";

const AddRenewal = () => {
  const [errors, setErrors] = useState({});
  const [plans, setPlans] = useState([]); 
  const [packages, setPackages] = useState([{ plan:'', price:'', doj:'', doe:''}])
  const [status, setStatus] = useState("Submit");
  const [loading, setLoading] = useState(true);
  const { memno } = useParams();


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
 
    for (const pkg of packages){
      if(!pkg.plan || !pkg.price || !pkg.doj || !pkg.doe) {
        return "Please fill in all required fields.";
      }
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
      packages: packages.map((pkg) => ({
          plan: pkg.plan,
          price: parseFloat(pkg.price),
          doj: pkg.doj,
          doe: pkg.doe
      }))
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
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }

    setStatus("Submit");
  };

    const handlePackageChange = (index, field, value) => {
      setPackages((prevPackages) => {
        const updatedPackages = [...prevPackages];
        updatedPackages[index][field] = value;

        if (field === 'plan') {
            const selectedPlan = plans.find((plan) => plan.planname === value);
            if (selectedPlan) {
              const validityInMonths = selectedPlan.validity;
              updatedPackages[index].price = selectedPlan.amount.toString();
              updatedPackages[index].plan = selectedPlan.planname;


              if(updatedPackages[index].doj) {
                const startDate = new Date(updatedPackages[index].doj);
                const endDate = new Date(startDate);
                endDate.setMonth(startDate.getMonth() + validityInMonths);
                updatedPackages[index].doe = endDate.toISOString().split('T')[0];
              }
            }
              else {
                updatedPackages[index].price = '';
                updatedPackages[index].doe = '';
              }
          }

        if(field === 'doj') {
          const selectedPlan = plans.find((plan) => plan.planname === updatedPackages[index].plan);
          if (selectedPlan) {
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
  
    const addPackage = () => {
      setPackages([...packages, { plan:'', price:'', doj:'', doe:''}]);
    };

    const removePackage = (index) => {
      const updatedPackages = packages.filter((_,i) => i!== index);
      setPackages(updatedPackages);
    }
          
 

  const handleCancel = () => {
  setPackages([{doj: "",
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

          {packages.map((pkg, index) => (
          <div key={index}>
          <div className="input-group">
          <div>
          <label>Plan</label>
          <select
            name="plan"
            className="input-field3"
            value={pkg.plan}
            onChange={(e) => handlePackageChange(index,'plan', e.target.value) }

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
            value={pkg.price}
            onChange={(e) => handlePackageChange(index,'price',e.target.value)}
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
                value={pkg.doj}
                onChange={(e) => handlePackageChange(index, 'doj', e.target.value)}
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                name="doe"
                className="input-field3"
                value={pkg.doe}
                readOnly
              />
            </div>
          </div>
          {index > 0 && (
                <button type="button" className="cancel" onClick={() => removePackage(index)}>
                  -</button>)}
          </div>
          ))}
                  <button type="button" className="add" onClick={addPackage}>Add</button>

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
