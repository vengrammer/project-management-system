
import SignUp from "./SignUp"
import logo from "@/assets/logo.png";
import Login from "./Login";
export default function LandingPageHome() {
    return (
        <div className="min-h-screen bg-linear-to-b flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full max-w-3xl relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-16 text-center border border-white/20">
                    <div className="mb-12">
                        <h1 className="text-5xl md:text-6xl font-black  mb-6 bg-linear-to-r text-blue-800 bg-clip-text ">
                            Project Management System
                        </h1>
                        <div className="flex flex-row gap-10 items-center justify-center ">
                            <div className="transform transition hover:scale-105 pt-10">
                                <SignUp />
                            </div>

                            <div className="transform transition hover:scale-105 pt-10">
                                <Login />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

