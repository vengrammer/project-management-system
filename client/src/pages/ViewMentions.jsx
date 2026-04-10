import { gql } from "@apollo/client";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { Calendar, Loader, SendHorizontal, XCircle } from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";

const GET_MENTIONS_BY_DATEMENTION = gql`
    query MentionsByDateMention($userId: ID, $isSender: Boolean, $datemention: String) {
        mentionsByDateMention(userId: $userId, isSender: $isSender, datemention: $datemention) {
            _id
            createdAt
            datemention
            message
            recipients {
                id
                fullname
            }
            replies {
                _id
                message
                createdAt
                sender {
                    id
                    fullname
                }
            }
            sender {
                fullname
                id
            }
            updatedAt
        }
    }
`;

const GET_MENTION_SELECTED = gql`
    query Mention($mentionId: ID!) {
        mention(id: $mentionId) {
            _id
            message
            datemention
            createdAt
            updatedAt
            recipients {
                id
                fullname
            }
            sender {
                id
                fullname
            }
            replies {
                _id
                createdAt
                message
                sender {
                    id
                    fullname
                }
            }
        }
    }
`;

const ADD_REPLY = gql`
    mutation AddReply($mentionId: ID, $sender: ID, $message: String) {
        addReply(mentionId: $mentionId, sender: $sender, message: $message) {
            _id
        }
    }
`;

function ViewMentions({ open = false, setOpen, datemention, initialSelectedMessage = "" }) {
    const location = useLocation();
    const isManager = location.pathname.includes("/manager");
    const isPm = location.pathname.includes("/projectmanager");
    const userId = useSelector((state) => state.auth.user.id);

    const [selectedMessage, setSelectedMessage] = useState("");
    const [replyMessage, setReplyMessage] = useState("");

    const { data: dataMentions, loading: loadingMentions, refetch: refetchMentions } = useQuery(GET_MENTIONS_BY_DATEMENTION, {
        variables: {
            userId,
            isSender: isManager || isPm,
            datemention,
        },
        skip: !open,
        onCompleted: (queryData) => {
            const availableMessages = queryData?.mentionsByDateMention ?? [];
            const defaultMessageId = availableMessages.some((message) => message._id === initialSelectedMessage)
                ? initialSelectedMessage
                : availableMessages[0]?._id;

            if (!defaultMessageId) {
                return;
            }

            setSelectedMessage((currentMessage) => currentMessage || defaultMessageId);
        },
    });

    const [getSelectedMention, { data: selectedMentionData, loading: loadingSelectedMention }] = useLazyQuery(GET_MENTION_SELECTED, {
        fetchPolicy: "network-only",
    });

    const [addReply, { loading: loadingReply }] = useMutation(ADD_REPLY, {
        onCompleted: async () => {
            toast.success("Reply sent successfully");
            setReplyMessage("");

            if (selectedMessage) {
                await getSelectedMention({
                    variables: {
                        mentionId: selectedMessage,
                    },
                });
            }

            await refetchMentions();
        },
        onError: () => {
            toast.error("Failed to send reply");
        },
    });

    const messages = useMemo(() => dataMentions?.mentionsByDateMention ?? [], [dataMentions]);
    const selectedMention = selectedMentionData?.mention;
    const recipientNames = useMemo(() => {
        return (selectedMention?.recipients ?? [])
            .map((recipient) => recipient?.fullname)
            .filter(Boolean)
            .join(", ");
    }, [selectedMention]);


    useEffect(() => {
        if (!initialSelectedMessage) {
            return;
        }

        setSelectedMessage(initialSelectedMessage);
    }, [initialSelectedMessage]);

    useEffect(() => {
        if (!selectedMessage) {
            return;
        }

        getSelectedMention({
            variables: {
                mentionId: selectedMessage,
            },
        });
    }, [selectedMessage, getSelectedMention]);

    const conversationItems = useMemo(() => {
        if (!selectedMention) {
            return [];
        }

        const originalMessage = {
            _id: selectedMention._id,
            message: selectedMention.message,
            createdAt: selectedMention.createdAt,
            sender: selectedMention.sender,
            isOriginal: true,
        };

        const replies = (selectedMention.replies ?? []).map((reply) => ({
            _id: reply._id,
            message: reply.message,
            createdAt: reply.createdAt,
            sender: reply.sender,
            isOriginal: false,
        }));

        return [originalMessage, ...replies];
    }, [selectedMention]);

    function normalizeDateValue(dateValue) {
        if (dateValue === null || dateValue === undefined || dateValue === "") {
            return null;
        }

        const numericValue = Number(dateValue);
        if (!Number.isNaN(numericValue)) {
            return numericValue < 1000000000000 ? numericValue * 1000 : numericValue;
        }

        return dateValue;
    }

    function formatDate(dateValue) {
        const normalizedDate = normalizeDateValue(dateValue);
        if (!normalizedDate) {
            return "No date";
        }

        const date = new Date(normalizedDate);
        if (Number.isNaN(date.getTime())) {
            return "Invalid date";
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    }

    function isOwnMessage(sender) {
        return String(sender?.id ?? "") === String(userId ?? "");
    }


    async function handleReplySubmit() {
        if (!replyMessage.trim() || !selectedMessage) {
            return;
        }

        await addReply({
            variables: {
                mentionId: selectedMessage,
                sender: userId,
                message: replyMessage.trim(),
            },
        });
    }

    function renderMessageBubble(item) {
        const ownMessage = isOwnMessage(item.sender);

        return (
            <div
                key={item._id}
                className={`flex w-full ${ownMessage ? "justify-end" : "justify-start"}`}
            >
                <div
                    className={`flex max-w-[80%] min-w-0 flex-col gap-2 rounded-3xl px-4 py-3 shadow-sm ${ownMessage
                        ? "rounded-br-md bg-blue-500 text-white"
                        : "rounded-bl-md bg-gray-200 text-gray-900 dark:bg-[#374347] dark:text-slate-100"
                        }`}
                >
                    <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-2 dark:border-white/10">
                        <p className={`text-xs font-semibold ${ownMessage ? "text-blue-100" : "text-slate-600 dark:text-slate-300"}`}>
                            {item.sender?.fullname ?? "Unknown sender"}
                        </p>
                        <p className={`text-[11px] ${ownMessage ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                            {formatDate(item.createdAt)}
                        </p>
                    </div>
                    {item.isOriginal && (
                        <p className={`text-[11px] font-medium uppercase tracking-wide ${ownMessage ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                            Original message
                        </p>
                    )}
                    <p className="whitespace-pre-wrap wrap-break-words text-sm">{item.message}</p>
                </div>
            </div>
        );
    }

    return (
        <Fragment>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm dark:bg-black/60">
                    <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white p-2 shadow-xl dark:bg-[#222732] dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)]">
                        <div className="flex min-h-160 flex-col">
                            <div className="flex items-center justify-between border-black px-6 pt-4 dark:border-[#2a3040]">
                                <h2 className="p-2">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">View Mentions</p>
                                    <div className="flex items-center gap-2 dark:text-slate-400">
                                        <Calendar size={17} />
                                        <p>{datemention || "No date selected"}</p>
                                    </div>
                                </h2>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-[#252d3d]"
                                >
                                    <XCircle size={24} className="cursor-pointer text-gray-500 dark:text-slate-400" />
                                </button>
                            </div>

                            <main className="flex h-full min-h-140 w-full flex-row overflow-hidden rounded border-2 border-black dark:border-[#2a3040]">
                                <aside className="max-h-140 min-h-full w-full max-w-80 overflow-auto border-r-2 border-black dark:border-[#2a3040]">
                                    {loadingMentions ? (
                                        <div className="flex h-full items-center justify-center p-4">
                                            <Loader className="animate-spin text-blue-500" size={32} />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="p-4 text-center text-slate-400">No mentions found for this date.</div>
                                    ) : (
                                        messages.map((message) => (
                                            <div
                                                key={message._id}
                                                onClick={() => setSelectedMessage(message._id)}
                                                className={`flex cursor-pointer flex-col gap-1 border-b-2 border-black p-3 transition-colors dark:border-[#2a3040] ${selectedMessage === message?._id
                                                    ? "bg-[#8eb5d0] dark:bg-[#0051b4]"
                                                    : "bg-gray-100 hover:bg-gray-200 dark:bg-[#2a3040] dark:hover:bg-[#313a4f]"
                                                    }`}
                                            >
                                                <p className="truncate font-medium text-gray-900 dark:text-slate-100">{message?.message}</p>
                                                <p className="truncate text-xs text-slate-600 dark:text-slate-300">
                                                    Sender: {message.sender?.fullname ?? "Unknown sender"}
                                                </p>
                                                <p className="self-end text-xs text-slate-500 dark:text-slate-400">
                                                    {formatDate(message.createdAt)}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </aside>

                                <section className="flex flex-1 flex-col justify-between bg-white dark:bg-[#1e2430]">
                                    <div className="border-b border-gray-200 px-4 py-3 dark:border-[#2a3040]">
                                        {selectedMention ? (
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                                                    Sender: {selectedMention.sender?.fullname ?? "Unknown sender"}
                                                </p>
                                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                                    Recipients: {recipientNames || "No recipients"}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Created: {formatDate(selectedMention.createdAt)}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-400">Select a mention to view the full conversation.</p>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-auto p-4">
                                        {loadingSelectedMention ? (
                                            <div className="flex h-full items-center justify-center">
                                                <Loader className="animate-spin text-blue-500" size={32} />
                                            </div>
                                        ) : !selectedMessage ? (
                                            <p className="self-center text-slate-400">No message selected.</p>
                                        ) : conversationItems.length === 0 ? (
                                            <p className="self-center text-slate-400">No conversation found for this mention.</p>
                                        ) : (
                                            <div className="flex flex-col gap-3">{conversationItems.map(renderMessageBubble)}</div>
                                        )}
                                    </div>

                                    <div className="flex w-full border-t-2 border-black dark:border-[#2a3040]">
                                        <div className="flex w-full items-center gap-3 px-3 py-2">
                                            <textarea
                                                value={replyMessage}
                                                onChange={(event) => setReplyMessage(event.target.value)}
                                                placeholder="Enter reply..."
                                                className="flex-1 resize-none border-none py-2 pl-3 outline-none focus:border-transparent focus:ring-0 dark:bg-transparent dark:text-slate-100"
                                                rows={2}
                                                disabled={!selectedMessage || loadingReply}
                                            />
                                            <button
                                                onClick={handleReplySubmit}
                                                disabled={!selectedMessage || !replyMessage.trim() || loadingReply}
                                                className="rounded-full bg-blue-500 p-3 text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {loadingReply ? <Loader className="animate-spin" size={18} /> : <SendHorizontal size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                </section>
                            </main>
                        </div>
                    </div>
                </div>
            )}
        </Fragment>
    );
}

export default ViewMentions;
