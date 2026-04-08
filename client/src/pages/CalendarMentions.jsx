
import { CloudCog, Loader, NotebookPen, NotepadText, Pin } from "lucide-react";
import { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import Addmention from "./Addmentions";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import ViewMentions from "./ViewMentions";

const GET_MENTIONS_BY_SENDER = gql`
    query MentionsBySender($senderId: ID!) {
        mentionsBySender(senderId: $senderId) {
            _id
            message
            sender {
                id
                fullname
            }
            recipients {
                id
                fullname
            }
            datemention
        }
    }
`

function CalendarMentions() {

    //get the current login user
    const auth = useSelector((state) => state.auth);
    const userId = auth.user?.id;

    //for the modal
    const [openAddNote, setOpenAddNote] = useState(false);
    const [openViewMentions, setOpenViewMentions] = useState(false);


    //data for the dates
    const today = new Date();
    const [curYear, setCurYear] = useState(today.getFullYear());
    const [curMonth, setCurMonth] = useState(today.getMonth());
    const firstDay = new Date(curYear, curMonth, 1).getDay();
    const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
    const currentDay = today.getDate()

    function handleYearChange(e) { setCurYear(Number(e.target.value)); setSelectedDay(null); }
    function handleMonthChange(e) { setCurMonth(Number(e.target.value)); setSelectedDay(null); }

    function buildYears() {
        const cur = new Date().getFullYear();
        const list = [];
        for (let y = 2020; y <= cur + 5; y++) list.push(y);
        return list;
    }

    const darkControl = [
        "dark:bg-[#31f64b] dark:text-black dark:border-transparent dark:font-bold",
        "dark:hover:bg-[#28d940] dark:hover:shadow-[0_0_10px_rgba(49,246,75,0.35)]",
        "transition-all duration-150",
    ].join(" ");

    const MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
    ];

    const WEEKS = [
        "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"
    ]

    //to get where should I insert the start day in the 35 boxes
    const daycells = [...Array(35)].map((_, i) => {
        const dayNumber = i - firstDay + 1;
        if (i < firstDay || dayNumber > daysInMonth) {
            return null;
        }
        return dayNumber;
    })

    const color_mentions = [
        "bg-purple-600",
        "bg-pink-600",
        "bg-emerald-600",
        "bg-orange-500"
    ];


    //get the mentions by sender or in the current user login
    const { loading: loadingSenderMentions, data: dataSenderMentions, refetch: refetchSenderMentions } = useQuery(GET_MENTIONS_BY_SENDER, { variables: { senderId: userId } });
    const dayMentions = dataSenderMentions?.mentionsBySender;



    const years = buildYears();
    const [dayClick, setDayClick] = useState(null);
    const dayClickForAddMention = (day) => {
        setDayClick(new Date(curYear, curMonth, day).toDateString());
    }

    const dayClickForViewMention = (day) => {
        setDayClick(new Date(curYear, curMonth, day).toDateString());
    }

    const filterDayMentions = (date, datemention, message) => {
        const cellDate = new Date(date);
        const mentionDate = new Date(Number(datemention));

        const isSameDay =
            cellDate.getFullYear() === mentionDate.getFullYear() &&
            cellDate.getMonth() === mentionDate.getMonth() &&
            cellDate.getDate() === mentionDate.getDate();

        if (isSameDay) {
            return message;
        }

        return null;
    };

    if (loadingSenderMentions) {
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
            <div className="dark:bg-gray-600 bg-gray-200 rounded-lg min-h-0  shadow dark:shadow-[0_2px_20px_rgba(0,0,0,0.5)] w-full h-full flex flex-col">
                <div className=" flex flex-col flex-1 min-h-0 rounded-">
                    <div className="flex w-full rounded-t-lg border just  p-2 ">
                        <div className="flex justuify-center items-center">
                            <p className="text-black dark:text-[#31f64b]  text-xl w-full  font-bold flex whitespace-nowrap ">Calendar Mentions</p>
                        </div>
                        <div className="flex w-full gap-1 justify-end">
                            {/* dropdown for the year */}
                            <select
                                value={curYear}
                                onChange={handleYearChange}
                                className={`border-2 border-slate-200 rounded-lg px-3 py-2 m-2 text-sm font-semibold
                                        text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer
                                        dark:focus:ring-[#31f64b]/40 ${darkControl}`}
                            >
                                {years.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>

                            {/* ── Month dropdown ── */}
                            <select
                                value={curMonth}
                                onChange={handleMonthChange}
                                className={`border-2 border-slate-200 m-2 rounded-lg px-3 py-2 text-sm font-semibold
                                    text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer
                                    dark:focus:ring-[#31f64b]/40 ${darkControl}`}
                            >
                                {MONTH_NAMES.map((name, i) => (
                                    <option key={i} value={i}>{name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {/* days of months */}
                    <div className=" dark:bg-gray-600 bg-gray-200 flex flex-1 h-full min-h-0 flex-col ">

                        <div className="flex w-full justify-between bg-blue-600 text-white border-3 border-[#060606]  dark:border-y-[#05fffb] px-1 flex-nowrap py-2">
                            <div className="font-bold">|</div>
                            {WEEKS.map((week, index) => (
                                <Fragment key={index}>
                                    <div key={index} className="flex items-center justify-center w-full">
                                        <p>{week}</p>
                                    </div>
                                    <div className="font-bold flex self-end">|</div>
                                </Fragment>
                            ))}
                        </div>

                        <div className="grid grid-cols-7  h-full w-full grid-rows-5 gap-2 p-2 ">
                            {/* weeks */}
                            {daycells.map((day, i) => {

                                return (
                                    <div key={i}

                                        className={`${day === null ? "pointer-events-none opacity-50 " : ""}group flex relative hover:scale-110 flex-col min-h-0 max-h-40 h-full bg-blue-700 border-2 rounded-2xl border-black`}>
                                        <div className="h-10 absolute z-10 ">
                                            <p className={`${day === currentDay && today.getMonth() === curMonth && today.getFullYear() === curYear ? " bg-[#06ff27] text-black" : "text-white"}  h-8 w-8 rounded-2xl  font-bold flex flex-col flex-1 items-center justify-center m-2`}>{day || null}</p>
                                        </div>

                                        {/*data: I filter the data based on their date then show to the calendar */}
                                        <div className="pt-9 px-2 flex flex-col flex-1 rounded-b-lg min-h-0 gap-0.5 overflow-hidden">
                                            {dayMentions?.map((data) => {
                                                const result = filterDayMentions(
                                                    new Date(curYear, curMonth, day),
                                                    data.datemention,
                                                    data.message
                                                );

                                                if (!result) return null;

                                                const randomIndex = Math.floor(Math.random() * color_mentions.length);

                                                return (
                                                    <p
                                                        key={data._id}
                                                        className={`${color_mentions[randomIndex]} rounded-2xl px-2 text-white dark:text-[#fff700] truncate  flex items-center gap-1`}
                                                    >
                                                        {result}
                                                    </p>
                                                );
                                            })}
                                        </div>
                                        {/*action button*/}
                                        <div className={` absolute h-full flex w-full b-1 items-end justify-end`}>
                                            <button onClick={() => {
                                                dayClickForViewMention(day);
                                                setOpenViewMentions(true)
                                            }}
                                                className="hidden group-hover:flex hover:scale-150 transform transition-all cursor-pointer bg-[#0ec7ff] rounded-lg h-8 w-10   items-center justify-center m-1 p-1">
                                                <NotepadText size={30} className="text-gray-800" />
                                            </button>
                                            <button onClick={() => {
                                                dayClickForAddMention(day);
                                                setOpenAddNote(true)
                                            }} className="hidden group-hover:flex hover:scale-150 transform transition-all cursor-pointer bg-[#0ad045] rounded-lg h-8 w-10   items-center justify-center m-1 p-1">
                                                <NotebookPen size={30} className="text-gray-800" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                    </div>
                </div>
            </div>
            {/* modal*/}
            {
                openAddNote && <Addmention open={openAddNote} setOpen={setOpenAddNote} datemention={dayClick} refetchSenderMentions={refetchSenderMentions} />
            }
            {
                openViewMentions && <ViewMentions open={openViewMentions} setOpen={setOpenViewMentions} datemention={dayClickForViewMention} />
            }
        </Fragment>
    )
}
export default CalendarMentions;