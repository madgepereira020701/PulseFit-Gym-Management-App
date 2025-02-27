import React, { useState, useEffect, useCallback } from "react";
import "./AddRenewal.css";
import { useNavigate, useParams } from "react-router-dom";
import moment from 'moment';

const AddRenewal = () => {
    const [plans, setPlans] = useState([]);
    const [packageData, setPackageData] = useState({
        plan: "",
        price: "",
        doj: "",
        doe: "",
    });
    const [status, setStatus] = useState("Submit");
    const { memno, plan: initialPlan, fullname } = useParams();
    const navigate = useNavigate();

    const calculateDoe = useCallback((planName, doj) => {
        const plan = plans.find((p) => p.planname === planName);
        if (!plan || !plan.validity || !doj) return "";

        const startDate = moment(doj);
        const endDate = moment(startDate).add(plan.validity, 'months');
        return endDate.format('YYYY-MM-DD');
    }, [plans]);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("No token found");
                return;
            }

            try {

                const plansResponse = await fetch("http://localhost:3000/addplans", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const plansData = await plansResponse.json();
                setPlans(plansData);

                const packagesResponse = await fetch(`http://localhost:3000/renewals/${fullname || memno}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!packagesResponse.ok) {
                    const errorData = await packagesResponse.json();
                    throw new Error(errorData.message || "Failed to fetch data");
                }

                const packagesData = await packagesResponse.json();

                if (initialPlan) {
                    const foundPlan = plansData.find(plan => plan.planname === initialPlan);

                    const latestPackage = findLatestPackage(initialPlan, packagesData.data.packages);
                    if (latestPackage) {
                        const nextDay = moment(latestPackage.doe).add(1, 'day').format('YYYY-MM-DD');
                        setPackageData({
                            plan: initialPlan,
                            price: foundPlan ? foundPlan.amount.toString() : "",
                            doj: nextDay,
                            doe: calculateDoe(initialPlan, nextDay),
                        });
                    } else {
                        setPackageData({
                            plan: initialPlan,
                            price: foundPlan ? foundPlan.amount.toString() : "",
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                alert(`Error fetching data: ${error.message}`);
            } 
        };

        fetchData();
    }, [initialPlan, navigate, fullname, memno, plans, calculateDoe]);

    const findLatestPackage = (planName, packages) => {
        if (!packages || packages.length === 0) return null;

        const packagesForPlan = packages.filter((pkg) => pkg.plan === planName);
        if (packagesForPlan.length === 0) return null;

        return packagesForPlan.reduce((latest, current) => {
            const latestDate = moment(latest.doe);
            const currentDate = moment(current.doe);
            return currentDate.isAfter(latestDate) ? current : latest;
        });
    };

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
            const response = await fetch(`http://localhost:3000/renewals/${fullname || memno}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit renewal");
            }

            const result = await response.json();
            alert(result.status);
            navigate(`/payments/${fullname || memno}`);

        } catch (error) {
            console.error("Error submitting form:", error);
            alert(error.message || "An error occurred. Please try again.");
        } finally {
            setStatus("Submit");
        }
    };

    const handleCancel = () => {
        setPackageData({ plan: "", price: "", doj: "", doe: "" });
        // Set other states to their initial values if needed
    };


    return (
        <div className="auth-container">
            <div className="form-container">
                <h2>Add Renewal</h2>
                <form onSubmit={handleSubmit}>

                    <div className="input-group" style={{ marginLeft: "20px"}}>
                        <div>
                            <label>Plan</label>
                            <input
                                type="text"
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