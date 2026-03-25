import { X } from "lucide-react";
import { useState } from "react"
import logo from "@/assets/logo.png";

function AddNewProgram({ open, setOpen }) {
    if (!open) return null;

    // Shared input class
    const inputCls =
        "w-full px-3 py-2 rounded-lg text-sm transition-all " +
        "border border-gray-300 dark:border-[#2a3040] " +
        "bg-white dark:bg-[#1a1f2b] " +
        "text-gray-800 dark:text-slate-200 " +
        "placeholder-gray-400 dark:placeholder-slate-600 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-[#31f64b]/40 " +
        "disabled:opacity-50 disabled:cursor-not-allowed";

    const sectionHeading = "text-sm font-semibold text-gray-700 dark:text-[#31f64b]/70 border-b border-gray-200 dark:border-[#2a3040] pb-2";
    const labelCls = "block text-sm font-medium text-gray-700 dark:text-slate-300";
    return (
        <>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
                    <form className=" bg-white dark:bg-[#222732] flex flex-1 flex-col max-w-280 rounded-xl h-full">
                        {/* ── Modal Header ── */}
                        <div className="flex flex-col items-center pt-2 px-2 pb-1 border-b-2 border-gray-200 dark:border-[#2a3040]">
                            <div className="w-full flex justify-end">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="text-gray-800 dark:text-slate-300 pr-2 cursor-pointer hover:text-gray-300 dark:hover:text-slate-200 transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="flex items-center gap-3 mt-2">
                                <div className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 dark:border-[#2a3040] overflow-hidden bg-white dark:bg-[#1a1f2b]">
                                    <img src={logo} alt="Logo" className="object-cover w-full h-full" />
                                </div>
                                <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                                    Create Program
                                </h2>
                            </div>
                            <p className="text-center text-sm text-gray-500 dark:text-slate-500 mt-1">
                                Please fill in the information below to create a new program.
                            </p>
                        </div>
                        <main className="flex flex-1 flex-col px-5  overflow-auto">
                            <div className="space-y-2   ">
                                <h3 className={sectionHeading}>Basic Information </h3>
                            </div>
                            <div className="space-y-4 px-6">
                                <p className={labelCls}>title <span className="text-red-600 text-xl font-bold">*</span></p>
                                <input type="text" placeholder="enter program title...." className={inputCls} />
                            </div>

                            {/* Timeline  and status*/}
                            <div className="space-y-4 p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <label className={labelCls}>
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"

                                            className={inputCls}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelCls}>
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"


                                            required
                                            className={inputCls}
                                        />
                                    </div>
                                    {/* Priority */}
                                    <div className="space-y-2">
                                        <label className={labelCls}>
                                            Priority <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            required
                                            className={inputCls + " appearance-none"}
                                        >
                                            <option value="">Select priority</option>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            
                            <div className="bg-green-400 flex flex-row h-full  flex-1">
                                {/*Departments*/}
                                <div className="flex h-full flex-col w-full">
                                    <input type="Search department" />
                                    <div className="bg-red-500 flex flex-col flex-1 h-full">

                                    </div>
                                </div>

                                {/*Managers*/}
                                <div className="flex h-full flex-col w-full">
                                    <input type="Search department" />
                                    <div className="bg-green-500 flex flex-col flex-1 h-full">

                                    </div>
                                </div>

                            </div>
                        </main>
                        <footer className="flex w-full justify-end items-center border-t-2 ">
                            <div className="flex gap-3 px-10 rounded-b-xl my-5">
                                <button className="dark:bg-gray-600 py-1 hover:scale-110 duration-200 border-gray-300 px-6 rounded-xl border-2">Cancel</button>
                                <button className="bg-[#0362f0] text-white hover:scale-110 duration-200 dark:bg-[#02eb21] py-1 font-bold dark:text-black px-6 rounded-xl border-2">Create Program</button>
                            </div>
                        </footer>
                    </form>
                </div>)}
        </>
    )
}

export default AddNewProgram