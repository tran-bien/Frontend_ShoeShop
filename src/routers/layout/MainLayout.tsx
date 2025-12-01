import { Outlet } from "react-router-dom";
import MainNavbar from "../../components/Navbar/MainNavbar";
import { Footer } from "../../components/Layout";
import AIChatbot from "../../components/Chat/AIChatbot";
import SupportChat from "../../components/Chat/SupportChat";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Chat components */}
      <AIChatbot />
      <SupportChat />
    </div>
  );
};

export default MainLayout;
