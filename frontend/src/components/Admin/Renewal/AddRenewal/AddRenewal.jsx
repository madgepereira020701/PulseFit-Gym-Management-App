import React, { useState, useEffect } from "react";
import "./AddRenewal.css";

const AddRenewal = () => {
  const [errors, setErrors] = useState({});
  const [members, setMembers] = useState([]); 
  const [plans, setPlans] = useState([]); 
  const [packages, setPackages] = useState([{ plan:'', price:'', dos:'', doe:''}])
  const [status, setStatus] = useState("Submit");
  const [formData, setFormData] = useState({
    memno: "",
    fullname: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);


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

        const membersResponse = await fetch("http://localhost:3000/members", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const membersData = await membersResponse.json();
        console.log("Members Response:", membersData);

        if (membersData.status === "SUCCESS") {
          setMembers(membersData.data);
        } else {
          console.error("Failed to load members data");
          alert("Failed to load members data");
        }

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
    if (!formData.fullname || !formData.memno || !formData.email) 
    {
      return "Please fill in all required fields.";
    }

    for (const pkg of packages){
      if(!pkg.plan || !pkg.price || !pkg.dos || !pkg.doe) {
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
   
    try {
      const datatosend = {...formData, packages}
      const response = await fetch("http://localhost:3000/renewals", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json", // Make sure we send JSON content
        },
        body: JSON.stringify(datatosend), // Send form data as the request body
      });

      const result = await response.json();
      alert(result.status); // Show success message or handle error from backend
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }

    setStatus("Submit");
  };

  const onInputChange = (e) => {
    const { name, value } = e.target;


    if (name === "fullname") {
      const selectedMember = members.find((member) => member.fullname === value);
      if (selectedMember) {
        setFormData((prevData) => ({
          ...prevData,
          memno: selectedMember.memno,
          email: selectedMember.email,
          fullname: value,
        }));
      }
    } 
  }

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


              if(updatedPackages[index].dos) {
                const startDate = new Date(updatedPackages[index].dos);
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

        if(field === 'dos') {
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
      setPackages([...packages, { plan:'', price:'', dos:'', doe:''}]);
    };

    const removePackage = (index) => {
      const updatedPackages = packages.filter((_,i) => i!== index);
      setPackages(updatedPackages);
    }
          
 

  const handleCancel = () => {
    setFormData({
      memno: "",
      fullname: "",
      email: "",
    });
  setPackages([{dos: "",
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

          <label>Full Name</label>
          <select
            name="fullname"
            className="input-field"
            value={formData.fullname}
            onChange={onInputChange}
          >
            <option value="">Select a Member</option>
            {members && members.length > 0 && members.map((member, index) => (
              <option key={index} value={member.fullname}>
                {member.fullname}
              </option>
            ))}
          </select>
          <br /><br />

          <label>Member ID</label>
          <input
            type="number"
            name="memno"
            placeholder="Member Number"
            className="input-field"
            value={formData.memno}
            readOnly
          />
          <br /><br />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="input-field"
            value={formData.email}
            readOnly
          />
          <br /><br />

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
                name="dos"
                className="input-field3"
                value={pkg.dos}
                onChange={(e) => handlePackageChange(index, 'dos', e.target.value)}
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
