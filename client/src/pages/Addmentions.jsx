import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { Calendar, Loader, SendHorizontal, XCircle } from "lucide-react";
import { Fragment } from "react";
import { useSelector } from "react-redux";
import { useState } from "react";
import { toast } from "react-toastify";

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
const GET_MANAGER = gql`
    query Users {
    userRoleManager {
        id
        fullname
        position
        department {
        id
        name
        }
    }
    }
`

const ADD_MENTION = gql`
    mutation Mutation($message: String, $sender: ID, $recipients: [ID], $datemention: String) {
        createMention(message: $message, sender: $sender, recipients: $recipients, datemention: $datemention) {
            _id
            message
            recipients {
                fullname
                id
            }
            sender {
                id
                fullname
            }
        }
    }
`

function Addmention({ open = false, setOpen, datemention, refetchSenderMentions }) {

    //get the current login user
    const auth = useSelector((state) => state.auth);
    const userId = auth.user?.id;
    const userDepartment = auth.user?.department.id;
    const isPm = useSelector((state) => state.auth.user?.role === "pm");

    //GET THE MEMBER FROM THE DEPARTMENT OF MANAGERS
    const { data: memberData } = useQuery(GET_MEMBER, {
        variables: {
            departmentId: userDepartment
        },
        skip: isPm
    })

    //GET THE MANAGERS
    const { data: managerData } = useQuery(GET_MANAGER, {
        skip: !isPm
    })



    //useState and variable need for mentions
    const [message, setMessage] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);

    const memberList = memberData?.department?.users
    const managerList = managerData?.userRoleManager

    const filteredMembers = isPm ? managerList : memberList?.filter((member) => member.id !== userId && member.role !== "admin" && member.role !== "pm");
    const allRecipientIds = filteredMembers?.map((member) => member.id) ?? [];
    const isAllSelected = allRecipientIds.length > 0 && allRecipientIds.every((id) => selectedMembers.includes(id));



    const localDate = new Date(datemention);
    localDate.setHours(localDate.getHours() + 8);

    //useMutation need for mentions
    const [addMention, { loading: loadingMention }] = useMutation(ADD_MENTION, {
        onCompleted: () => {
            toast.success("Successfully sent message!");
            refetchSenderMentions();
            setOpen(false);
        },
        onError: () => {
            toast.error("Failed to send message!");
        },
    });

    const handleAddMention = async () => {
        await addMention({
            variables: {
                message: message,
                sender: userId,
                recipients: selectedMembers,
                datemention: localDate.toISOString(),
            },
        });
        setOpen(false);
    };

    const handleToggleAllRecipients = () => {
        setSelectedMembers(isAllSelected ? [] : allRecipientIds);
    };

    if (loadingMention) {
        return (
            <div className="fixed h-screen   inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
                <div className="flex flex-col items-center gap-3">
                    <Loader
                        size={70}
                        className="animate-spin text-blue-500 dark:text-[#31f64b]"
                    />
                </div>
            </div>
        );
    }

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
                                    <span className="dark:text-slate-400 text-sm">{new Date(datemention).toDateString()}</span>
                                </div>
                                <div className="flex-1 pt-4 ">
                                    <div className="flex w-full items-center justify-between pb-2">
                                        <p className="dark:text-slate-350">Select Member</p>
                                        <button
                                            type="button"
                                            onClick={handleToggleAllRecipients}
                                            disabled={allRecipientIds.length === 0}
                                            className="rounded bg-blue-600 px-3 py-1 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-gray-400"
                                        >
                                            {isAllSelected ? "Clear All" : "Select All"}
                                        </button>
                                    </div>
                                    <p className="pb-2 text-xs text-slate-500 dark:text-slate-400">
                                        {selectedMembers.length} recipient{selectedMembers.length === 1 ? "" : "s"} selected
                                    </p>

                                    <div className="flex flex-col max-h-30 border-gray-400 dark:border-none rounded bg-gray-400 overflow-y-auto border-2">


                                        <div className="dark:bg-[#374347] bg-gray-300 w-full flex flex-col">
                                            {(!filteredMembers || filteredMembers.length === 0) ? (
                                                <div className="text-center py-2 dark:text-slate-400">No Members</div>
                                            ) : (
                                                filteredMembers.map((member) => (
                                                    <div
                                                        key={member.id}
                                                        onClick={() => {
                                                            setSelectedMembers((prev) =>
                                                                prev.includes(member.id)
                                                                    ? prev.filter((id) => id !== member.id)
                                                                    : [...prev, member.id]
                                                            );
                                                        }}
                                                        className="flex justify-between items-center w-full min-w-0 px-3 py-1 truncate border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-[#2a3040]"
                                                    >
                                                        <p className="px-2 dark:text-slate-300 gap-4 flex truncate">
                                                            <span className="truncate">{member.fullname}</span>
                                                            <span className="dark:text-slate-400">
                                                                ({member.position})
                                                            </span>
                                                        </p>
                                                        <input
                                                            className="w-4 h-4"
                                                            type="checkbox"
                                                            checked={selectedMembers.includes(member.id)}
                                                            onChange={() => { }}
                                                            onClick={selectedMembers.includes(member.id)}
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex w-full  px-4 flex-col gap-2">
                                {/*text area*/}
                                <textarea
                                    name="" id=""
                                    placeholder="enter message or note..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="border-2 bg-gray-300 dark:bg-[#374347] py-1 px-2 min-h-40 w-full rounded">
                                </textarea>

                                <div className="flex w-full justify-end gap-2">
                                    {/* <button onClick={() => setMessage("")} className="bg-[#db0134] text-white  py-2 px-8 rounded flex items-center gap-2">Erase <span><Eraser /></span></button> */}
                                    <button onClick={handleAddMention} disabled={message.length === 0} className="bg-[#0643f7] cursor-pointer disabled:bg-gray-400 text-white  py-2 px-8 rounded flex items-center gap-2">Send <span><SendHorizontal /></span></button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>}
        </Fragment>
    )
}
export default Addmention;
