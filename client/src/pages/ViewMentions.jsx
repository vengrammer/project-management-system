import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Calendar, Eraser, Plus, Send, SendHorizontal, SendIcon, XCircle } from "lucide-react";
import { Fragment } from "react";
import { useSelector } from "react-redux";

const GET_MEMBER = gql`
    query Department($departmentId: ID) {
        department(id: $departmentId) {
            id
            name
            users {
            id
            fullname
            role
            position
            }
        }
    }
`

function ViewMentions({ open = false, setOpen }) {

    //get the current login user
    const auth = useSelector((state) => state.auth);
    const userId = auth.user?.id;
    const userDepartment = auth.user?.department.id;
    //GET THE MEMBER FROM THE DEPARTMENT OF MANAGERS
    const {data: memberData} = useQuery(GET_MEMBER, {
        variables: {
            departmentId: userDepartment
        }
    })
    const memberList = memberData?.department?.users
    const filteredMembers = memberList?.filter((member) => member.id !== userId && member.role !== "admin");
    console.log("filteredMembers",filteredMembers);

    return (
        <Fragment>
            {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white p-2 dark:bg-[#222732] rounded-xl shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-2xl max-h-[90vh] overflow-y-auto" >

                    <div className="flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-4  border-gray-200 dark:border-[#2a3040]">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                                Add Mention
                            </h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-[#252d3d] rounded-lg transition-colors"
                            >
                                <XCircle size={24} className="text-gray-500 dark:text-slate-400 cursor-pointer" />
                            </button>
                        </div>
                        {/* main */}
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2  w-full justify-between pt-2 pb-2 px-4">
                                <div className=" flex  gap-2 items-center border-b pb-2">
                                    <Calendar size={16} className="dark:text-slate-400" />
                                    <span className="dark:text-slate-400 text-sm">March 12 2026</span>
                                </div>
                                <div className="flex-1 pt-4">
                                    <p className="dark:text-slate-350">Select Member</p>
                                    <div className="flex flex-col max-h-30 w- overflow-y-auto border-2">


                                        <div className="dark:bg-[#374347] w-full flex flex-col ">
                                            {filteredMembers.map((member) => (<div key={member.id} className="flex justify-between items-center w-full min-w-0 px-3 truncate border-b">
                                                <p className="px-2 dark:text-slate-300  gap-4 flex truncate"> <span className="truncate">{member.fullname}</span> <span className="dark:text-slate-400">({member.position})</span> </p>
                                                <input type="checkbox" id="item" />
                                            </div>))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full px-4 flex-col gap-2">
                                <textarea name="" id="" placeholder="enter mentions..." className="border-2 py-1 px-2 min-h-40 w-full rounded "></textarea>
                                <div className="flex w-full justify-end gap-2">
                                    <button className="bg-[#db0134] text-white  py-2 px-8 rounded flex items-center gap-2">Erase <span><Eraser /></span></button>
                                    <button className="bg-green-600 text-white  py-2 px-8 rounded flex items-center gap-2">Send <span><SendHorizontal /></span></button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>}
        </Fragment>
    )
}
export default ViewMentions;