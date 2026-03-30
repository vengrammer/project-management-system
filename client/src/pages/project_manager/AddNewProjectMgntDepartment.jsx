import { XCircle } from "lucide-react";
import { Fragment } from "react";

function AddNewProjectMgntDepartment({ open, setOpen, department, managers }) {
  const labelCls = "block text-sm font-medium text-gray-700 dark:text-slate-300";

  return (
    <Fragment>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white gap-2 dark:bg-[#222732] rounded-xl shadow-xl dark:shadow-[0_4px_40px_rgba(0,0,0,0.6)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#2a3040]">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Current Department Managers</h2>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-[#252d3d] rounded-lg transition-colors" onClick={() => setOpen(false)}>
                <XCircle size={24} className="text-gray-500 dark:text-slate-400 cursor-pointer" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={labelCls}>Department</label>
                  <input
                    type="text"
                    value={department?.name || "--"}
                    disabled
                    className="w-full px-3 py-2 rounded-md text-sm border border-gray-300 dark:border-[#2a3040] bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-slate-200 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelCls}>Managers</label>
                  <div className="flex flex-col w-full max-h-60 border-2 border-gray-200 dark:border-[#2a3040] rounded overflow-y-auto">
                    {managers && managers.length > 0 ? (
                      managers.map((manager) => (
                        <div key={manager.id} className="py-2 px-3 border-b border-gray-200 dark:border-[#1f2937]">
                          <p className="font-medium text-gray-800 dark:text-slate-200">{manager.fullname || manager.name || "Unnamed"}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Role: {manager.role || "manager"}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-sm text-gray-500 dark:text-gray-300">No managers currently assigned to this department.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default ViewCurrentManager;