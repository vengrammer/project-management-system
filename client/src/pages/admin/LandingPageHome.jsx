import Login from "./Login";
export default function LandingPageHome() {
    return (
        <div className="min-h-screen bg-linear-to-b flex items-center justify-center p-4 relative overflow-hidden">
            <div className="w-full max-w-3xl relative z-10">
                <div className="text-center">
                    <div className="mb-12">
                        <div className="flex flex-row gap-10 items-center justify-center ">
                            <Login/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}