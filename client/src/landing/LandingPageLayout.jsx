
import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import background from "@/assets/background.jpg";

function LandingPageLayout(){
  return (
    <>
      <div>
        <Navbar/>
        <div className="w-full bg-cover bg-center min-h-screen" style={{backgroundImage:   `url(${background})`}}>
            <Outlet/>
        </div>
      </div>
    </>
  )
}

export default LandingPageLayout;