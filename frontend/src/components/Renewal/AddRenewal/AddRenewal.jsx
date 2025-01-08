import React, { useState, useEffect } from "react";
import "./AddRenewal.css";

const AddRenewal = () => {
  const [errors, setErrors] = useState({});
  const [members, setMembers] = useState([]); 
  const [plans, setPlans] = useState([]); 
  const [status, setStatus] = useState("Submit");
  const [formData, setFormData] = useState({
    memno: "",
    fullname: "",
    email: "",
    dos: "",
    doe: "",
    price: "",
    plan: "",
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

  const validateFields = (values) => {
    if (
      !values.fullname ||
      !values.memno ||
      !values.email ||
      !values.dos ||
      !values.doe ||
      !values.price ||
      !values.plan
    ) {
      return "Please fill in all required fields.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    // Validate form data
    const errorMessage = validateFields(formData);
    if (errorMessage) {
      setErrors({ message: errorMessage });
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
      const response = await fetch("http://localhost:3000/send-email", {
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
    } else if (name === "plan") {
      const selectedPlan = plans.find((plan) => plan.planname === value);
      if (selectedPlan) {
        setFormData((prevData) => {
          const validityMonths = selectedPlan.validity;
          let newDoe = prevData.doe;
          if (prevData.dos) {
            const startDate = new Date(prevData.dos);
            startDate.setMonth(startDate.getMonth() + validityMonths);
            newDoe = startDate.toISOString().split("T")[0];
          }

          return {
            ...prevData,
            price: selectedPlan.amount.toString(),
            plan: value,
            doe: newDoe, // Update doe if applicable
          };
        });
      }
    } else if (name === "dos") {
      setFormData((prevData) => {
        if (prevData.plan) {
          const selectedPlan = plans.find((plan) => plan.planname === prevData.plan);
          const startDate = new Date(value);
          const validityMonths = selectedPlan?.validity || 0;
          startDate.setMonth(startDate.getMonth() + validityMonths);
          const endDate = startDate.toISOString().split("T")[0];

          return {
            ...prevData,
            dos: value,
            doe: endDate, // Ensure doe is updated based on the new start date
          };
        } else {
          return { ...prevData, dos: value };
        }
      });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCancel = () => {
    setFormData({
      memno: "",
      fullname: "",
      email: "",
      dos: "",
      doe: "",
      price: "",
      plan: "",
    });
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

          <label>Plan</label>
          <select
            name="plan"
            className="input-field"
            value={formData.plan}
            onChange={onInputChange}
          >
            <option value="">Select a Plan</option>
            {plans.map((plan, i) => (
              <option key={i} value={plan.planname}>
                {plan.planname}
              </option>
            ))}
          </select>
          <br /><br />

          <label>Price</label>
          <input
            type="number"
            name="price"
            placeholder="Price"
            className="input-field"
            value={formData.price}
          />
          <br /><br />


          <div className="input-group">
            <div>
              <label>Start Date</label>
              <input
                type="date"
                name="dos"
                className="input-field3"
                value={formData.dos}
                onChange={onInputChange}
              />
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                name="doe"
                className="input-field3"
                value={formData.doe}
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
