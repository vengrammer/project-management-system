import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Calendar, Eraser, Plus, Send, SendHorizontal, SendIcon, XCircle } from "lucide-react";
import { Fragment } from "react";
import { useSelector } from "react-redux";


function ViewMentions({ open = false, setOpen }) {
    return (
        <Fragment>
            {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white p-2 dark:bg-[#222732] rounded-xl shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-4xl max-h-[90vh] overflow-y-auto" >

                    <div className="flex flex-col h-100">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-4  border-gray-200 dark:border-[#2a3040]">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                                View Mentions
                            </h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-[#252d3d] rounded-lg transition-colors"
                            >
                                <XCircle size={24} className="text-gray-500 dark:text-slate-400 cursor-pointer" />
                            </button>
                        </div>
                       <aside className="flex h-full  flex-col w-full max-h-60 border-2 border-gray-200 dark:border-[#2a3040] rounded overflow-y-auto">

                       </aside>
                    </div>

                </div>
            </div>}
        </Fragment>
    )
}
export default ViewMentions;