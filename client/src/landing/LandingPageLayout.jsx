
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import background from "@/assets/background.jpg";

function LandingPageLayout() {
  return (
    <>
      <div>
        <div
          className="w-full bg-cover bg-center min-h-screen overflow-hidden"
          style={{
            backgroundImage: `url(${background})`,
            maxWidth: "100%",
            height: "auto",
          }}
        >
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default LandingPageLayout;