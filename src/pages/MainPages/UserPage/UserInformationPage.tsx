import React, { useEffect } from "react";
import Sidebar from "../../../components/User/Sidebar";
import UserForm from "../../../components/User/UserForm";
// import banner from "../../../assets/banner.jpg";

const UserInformation: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}

      <div className="flex flex-1 bg-mono-100">
        {/* Sidebar */}
        <Sidebar />

        {/* Nội dung chính */}
        <div className="flex flex-1 justify-center items-center p-10 gap-10">
          {/* Form */}
          <UserForm />

          {/* Banner */}
          {/*<div className="w-56 flex justify-center items-center">
            <img
              src={banner}
              alt="Quậng cáo"
              className="rounded-lg shadow-lg object-contain w-full"
            />
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default UserInformation;
