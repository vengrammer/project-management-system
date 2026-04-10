import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Calendar, Eraser, Plus, Send, SendHorizontal, SendIcon, XCircle } from "lucide-react";
import { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";


const GET_MENTIONS_BY_DATEMENTION = gql`
        query MentionsByDateMention($userId: ID, $isSender: Boolean, $datemention: String) {
            mentionsByDateMention(userId: $userId, isSender: $isSender, datemention: $datemention) {
                _id
                createdAt
                datemention
                message
                readBy {
                    id
                    fullname
                }
                recipients {
                    id
                    fullname
                }
                replies {
                    _id
                    message
                    createdAt
                }
                sender {
                    fullname
                    id
                }
                updatedAt
            }
        }
`



function ViewMentions({ open = false, setOpen, datemention }) {
    
    const location = useLocation();
    const isManager = location.pathname.includes("/manager");
    const isEmployee = location.pathname.includes("/employee");
    const isPm = location.pathname.includes("/projectmanager");
    const userId = useSelector((state) => state.auth.user.id);

    const [selectedMessage, setSelectedMessage] = useState(null);

    const { data: dataMentions } = useQuery(GET_MENTIONS_BY_DATEMENTION, {
        variables: {
            userId: userId,
            isSender: isManager || isPm ? true : false,
            datemention: datemention
        }
    })
    const messages = dataMentions?.mentionsByDateMention



    function replyOriginalMessage(isMessage, messageId, userId) {
        if(!messageId) return null

        if (isMessage) {
            return (
                <div className="bg-[#e1cece] text-black rounded-4xl p-2 max-w-80 min-w-0 gap-3 flex flex-col">
                    <p className="wrap-break-word whitespace-pre-wrap border-b-2 border-black">
                        efsdfsdfawsdasdasdsdfsdfsdfsdfsdffffffffffffffsdffdddddddddddddddddssssssssssssssssssssssssssssssssssssssssssssssssss
                    </p>
                    <div className="flex justify-between">
                        <div>
                            <p className="text-[12px] flex items-end justify-end text-[#0c0cff]">Reven Gerona</p>
                        </div>
                        <div>
                            <p className="text-[12px] flex items-end justify-end text-[#0c0cff]">March 13 2020</p>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className="flex w-full items-end justify-end gap-3 flex-col">
                    <div className=" bg-blue-500 rounded-t-4xl rounded-bl-4xl p-2 max-w-80 min-w-0">
                        <p className="wrap-break-word whitespace-pre-wrap  border-b-2 border-black">
                            efsdfsdfawsdasdasdsdfsdfsdfsdfsdffffffffffffffsdffdddddddddddddddddssssssssssssssssssssssssssssssssssssssssssssssssss
                        </p>
                        <div className="flex justify-between">
                            <div>
                                <p className="text-[12px] flex items-end justify-end text-[#baff0c]">Reven Gerona</p>
                            </div>
                            <div>
                                <p className="text-[12px] flex items-end justify-end text-[#baff0c]">March 13 2020</p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }


    }

    return (
        <Fragment>
            {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white p-2 dark:bg-[#222732] rounded-xl shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-4xl max-h-[90vh] overflow-y-auto" >

                    <div className="flex flex-col h-full min-h-100">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-4  border-black dark:border-[#2a3040]">
                            <h2 className="p-2">
                                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">View Mentions</p>
                                <div className="flex items-center justify-center gap-2  dark:text-slate-400">

                                    <Calendar size={17} />
                                    <p>{datemention ? datemention : "no date"} </p>
                                </div>

                            </h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-[#252d3d] rounded-lg transition-colors"
                            >
                                <XCircle size={24} className="text-gray-500 dark:text-slate-400 cursor-pointer" />
                            </button>
                        </div>
                        <main className="flex flex-row h-full min-h-100   w-full border-2 border-black dark:border-[#2a3040] rounded">
                            {/* first message  */}
                            <aside className="flex-1 max-w-70 max-h-150 min-h-full   overflow-auto border-black  border-r-2 ">
                                {messages?.map((message) => (<div key={message._id} className=" flex w-full hover:bg-gray-500  border-black border-b-2 p-3 cursor-pointer bg-gray-600">
                                    <p className="truncate">{message?.message}</p>
                                </div>))}
                            </aside>
                            <main className="flex-1 flex flex-col justify-between max-h-150 min-h-150">
                                {/* Content of message */}
                                <div className="flex-1 overflow-auto">
                                    <div className="flex flex-col w-full p-2 gap-2 ">
                                        {replyOriginalMessage(true)}
                                        {replyOriginalMessage(false)}
                                    </div>
                                </div>
                                {/* Create new message */}
                                <div className="flex w-full border-t-2 border-black" >
                                    <div className="flex w-full items-center justify-center px-2  ">
                                        <textarea type="text" placeholder="enter reply....." className="pl-3  mr-4 w-full text-wrap outline-none  py-2 flex-1 active:border-none focus:ring-0 focus:border-transparent active:ring-0 border-none" />
                                        <SendHorizontal className="cursor-pointer" />
                                    </div>
                                </div>
                            </main>
                        </main>
                    </div>
                </div>
            </div>}
        </Fragment>
    )
}
export default ViewMentions;