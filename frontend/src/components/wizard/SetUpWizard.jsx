import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PersonelForm from "../../pages/actions/PersonelForm";
import StudentForm from "../../pages/actions/StudentForm";
import ParentForm from "../../pages/actions/ParentForm";
import SchoolSettings from "../../pages/settings/SchoolSettings";

const SetupWizard = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const goToNextStep = () => setStep((prev) => prev + 1);

  // Redirect when wizard is done
  useEffect(() => {
    if (step > 3) {
      navigate("/dashboard");
    }
  }, [step, navigate]);
 
  return (
    <div className="min-h-screen bg-gray-950 flex justify-center items-center">
      {step === 1 && <SchoolSettings onNext={goToNextStep} />}
      {step === 2 && <PersonelForm onNext={goToNextStep} />}
      {step === 3 && <StudentForm onNext={goToNextStep} />}
      {step === 4 && <ParentForm onNext={goToNextStep} />}
    </div>
  );
};

export default SetupWizard;
