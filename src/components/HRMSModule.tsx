import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Clock,
  Calendar,
  FileText,
  DollarSign,
  CheckCircle2,
  XCircle,
  Building,
  Printer,
  Search,
} from 'lucide-react';
import {
  Organization,
  Branch,
  Department,
  Employee,
  AttendanceRecord,
  LeaveRequest,
} from '../types';

interface HRMSModuleProps {
  currentOrg: Organization;
  currentBranch: Branch;
  departments: Department[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  onAddEmployee: (emp: Partial<Employee>) => void;
  onPunchAttendance: (empId: string, empName: string) => void;
  onUpdateLeaveStatus: (leaveId: string, status: 'approved' | 'rejected') => void;
}

export const HRMSModule: React.FC<HRMSModuleProps> = ({
  currentOrg,
  currentBranch,
  departments,
  employees,
  attendance,
  leaveRequests,
  onAddEmployee,
  onPunchAttendance,
  onUpdateLeaveStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'leaves' | 'payroll'>('employees');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddEmpModalOpen, setIsAddEmpModalOpen] = useState(false);
  const [selectedPayslipEmp, setSelectedPayslipEmp] = useState<Employee | null>(null);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    departmentId: departments[0]?.id || 'dept-eng',
    salary: '',
  });

  const orgEmployees = useMemo(
    () => employees.filter((e) => e.organizationId === currentOrg.id),
    [employees, currentOrg.id]
  );

  const orgLeaves = useMemo(
    () => leaveRequests.filter((l) => l.organizationId === currentOrg.id),
    [leaveRequests, currentOrg.id]
  );

  const filteredEmployees = useMemo(() => {
    return orgEmployees.filter(
      (e) =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orgEmployees, searchTerm]);

  const totalMonthlyPayroll = useMemo(() => {
    return orgEmployees.reduce((sum, e) => sum + e.salary, 0);
  }, [orgEmployees]);

  const handleCreateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEmployee({
      organizationId: currentOrg.id,
      branchId: currentBranch.id,
      departmentId: newEmp.departmentId,
      name: newEmp.name,
      email: newEmp.email,
      phone: newEmp.phone,
      designation: newEmp.designation,
      salary: parseFloat(newEmp.salary) || 150000,
      dateOfJoining: new Date().toISOString().split('T')[0],
      avatar: '/src/assets/images/avatar_ceo_executive_1793707704596.jpg',
    });
    setIsAddEmpModalOpen(false);
    setNewEmp({
      name: '',
      email: '',
      phone: '',
      designation: '',
      departmentId: departments[0]?.id || 'dept-eng',
      salary: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Human Resources & Payroll (HRMS)
          </h1>
          <div className="text-xs text-slate-500 mt-0.5">
            Workforce roster · Digital biometric punch log · Leave authorizations · Payslips
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPunchAttendance('emp-101', 'Current User')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Punch Daily Attendance</span>
          </button>
          <button
            onClick={() => setIsAddEmpModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Onboard Personnel</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Active Personnel</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {orgEmployees.length} Headcount
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Monthly Gross Payroll</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            ₹ {totalMonthlyPayroll.toLocaleString()}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Pending Leave Authorizations</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {orgLeaves.filter((l) => l.status === 'pending').length} Requests
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="text-xs text-slate-500 mb-1">Operational Departments</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {departments.length} Divisions
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs max-w-fit">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'employees'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Staff Directory ({orgEmployees.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'attendance'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Attendance Punch Logs
        </button>
        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'leaves'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Leave Management ({orgLeaves.length})
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-3 py-1.5 font-medium rounded-md transition-colors ${
            activeTab === 'payroll'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Salary Payslip Generator
        </button>
      </div>

      {/* TAB 1: EMPLOYEES DIRECTORY */}
      {activeTab === 'employees' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, designation, or code..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Personnel</th>
                  <th className="pb-2.5">Emp Code</th>
                  <th className="pb-2.5">Designation</th>
                  <th className="pb-2.5">Contact</th>
                  <th className="pb-2.5">Joining Date</th>
                  <th className="pb-2.5 text-right">Base Salary</th>
                  <th className="pb-2.5 text-right">Status</th>
                  <th className="pb-2.5 text-right">Payslip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-sans">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">{emp.employeeCode}</td>
                    <td className="py-3 font-sans font-medium text-slate-700 dark:text-slate-300">
                      {emp.designation}
                    </td>
                    <td className="py-3 text-slate-500 font-sans">{emp.email}</td>
                    <td className="py-3 text-slate-400">{emp.dateOfJoining}</td>
                    <td className="py-3 text-right font-semibold text-slate-900 dark:text-white">
                      ₹{emp.salary.toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-sans">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-sans">
                      <button
                        onClick={() => setSelectedPayslipEmp(emp)}
                        className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        Generate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Daily Biometric Check-in Records
              </h2>
              <div className="text-xs text-slate-500">Live timestamp tracking for all corporate branches</div>
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Today: {new Date().toISOString().split('T')[0]}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Employee Name</th>
                  <th className="pb-2.5">Date</th>
                  <th className="pb-2.5">In Time</th>
                  <th className="pb-2.5">Out Time</th>
                  <th className="pb-2.5 text-right">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {attendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-sans font-semibold text-slate-900 dark:text-slate-100">
                      {rec.employeeName}
                    </td>
                    <td className="py-3 text-slate-500">{rec.date}</td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400 font-medium">{rec.checkIn}</td>
                    <td className="py-3 text-slate-500">{rec.checkOut || 'Active In-Office'}</td>
                    <td className="py-3 text-right font-sans">
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVES */}
      {activeTab === 'leaves' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Leave Applications & Approvals
            </h2>
            <span className="text-xs text-slate-400">{orgLeaves.length} total entries</span>
          </div>

          <div className="space-y-3">
            {orgLeaves.map((leave) => (
              <div
                key={leave.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{leave.employeeName}</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {leave.startDate} to {leave.endDate} ({leave.days} days)
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {leave.leaveType}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 italic">"{leave.reason}"</div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {leave.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => onUpdateLeaveStatus(leave.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => onUpdateLeaveStatus(leave.id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 hover:bg-rose-50 font-semibold text-[11px] transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-bold uppercase ${
                        leave.status === 'approved' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                      }`}
                    >
                      {leave.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAYROLL TABLE */}
      {activeTab === 'payroll' && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                Statutory Payroll & Payslip Dispatch
              </h2>
              <div className="text-xs text-slate-500">Includes Provident Fund (PF) and TDS withholding calculations</div>
            </div>
            <div className="text-xs font-semibold tabular-nums text-slate-900 dark:text-white">
              Total Run: ₹{totalMonthlyPayroll.toLocaleString()}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                  <th className="pb-2.5">Employee</th>
                  <th className="pb-2.5">Designation</th>
                  <th className="pb-2.5 text-right">Gross CTC</th>
                  <th className="pb-2.5 text-right">Basic (50%)</th>
                  <th className="pb-2.5 text-right">PF (12%)</th>
                  <th className="pb-2.5 text-right">TDS (Est.)</th>
                  <th className="pb-2.5 text-right">Net Payable</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {orgEmployees.map((emp) => {
                  const basic = Math.round(emp.salary * 0.5);
                  const pf = Math.round(basic * 0.12);
                  const tds = Math.round(emp.salary * 0.1);
                  const netPay = emp.salary - pf - tds;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-sans font-semibold text-slate-900 dark:text-slate-100">
                        {emp.name}
                      </td>
                      <td className="py-3 font-sans text-slate-500">{emp.designation}</td>
                      <td className="py-3 text-right">₹{emp.salary.toLocaleString()}</td>
                      <td className="py-3 text-right text-slate-500">₹{basic.toLocaleString()}</td>
                      <td className="py-3 text-right text-rose-500">-₹{pf.toLocaleString()}</td>
                      <td className="py-3 text-right text-rose-500">-₹{tds.toLocaleString()}</td>
                      <td className="py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{netPay.toLocaleString()}
                      </td>
                      <td className="py-3 text-right font-sans">
                        <button
                          onClick={() => setSelectedPayslipEmp(emp)}
                          className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PAYSLIP MODAL */}
      {selectedPayslipEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">Monthly Salary Certificate</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedPayslipEmp(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold px-2"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="border border-slate-300 rounded-lg p-6 space-y-4 bg-white text-slate-900 font-sans text-xs">
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="font-bold text-base text-slate-900">{currentOrg.legalName}</div>
                <div className="text-slate-500 text-[11px]">Salary Slip for October 2026</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono border-b border-slate-200 pb-3">
                <div>
                  <span className="text-slate-400 font-sans">Name:</span> {selectedPayslipEmp.name}
                  <br />
                  <span className="text-slate-400 font-sans">Code:</span> {selectedPayslipEmp.employeeCode}
                </div>
                <div>
                  <span className="text-slate-400 font-sans">Designation:</span> {selectedPayslipEmp.designation}
                  <br />
                  <span className="text-slate-400 font-sans">Branch:</span> {currentBranch.code}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 text-xs font-mono">
                <div className="space-y-1.5">
                  <div className="font-bold font-sans text-slate-900 border-b pb-1">EARNINGS</div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Basic Salary</span>
                    <span>₹{Math.round(selectedPayslipEmp.salary * 0.5).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">House Rent Allowance</span>
                    <span>₹{Math.round(selectedPayslipEmp.salary * 0.3).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Special Allowance</span>
                    <span>₹{Math.round(selectedPayslipEmp.salary * 0.2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span className="font-sans">Gross Salary</span>
                    <span>₹{selectedPayslipEmp.salary.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-bold font-sans text-slate-900 border-b pb-1">DEDUCTIONS</div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Provident Fund (PF)</span>
                    <span className="text-rose-600">
                      ₹{Math.round(selectedPayslipEmp.salary * 0.5 * 0.12).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-600">Income Tax (TDS)</span>
                    <span className="text-rose-600">
                      ₹{Math.round(selectedPayslipEmp.salary * 0.1).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span className="font-sans">Total Deductions</span>
                    <span className="text-rose-600">
                      ₹
                      {Math.round(
                        selectedPayslipEmp.salary * 0.5 * 0.12 + selectedPayslipEmp.salary * 0.1
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-300 flex justify-between items-center bg-slate-50 p-3 rounded-lg font-mono">
                <span className="font-bold font-sans text-slate-900">NET DISBURSED SALARY:</span>
                <span className="text-base font-bold text-emerald-700">
                  ₹
                  {Math.round(
                    selectedPayslipEmp.salary -
                      (selectedPayslipEmp.salary * 0.5 * 0.12 + selectedPayslipEmp.salary * 0.1)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {isAddEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Onboard Personnel to Roster
              </h3>
              <button
                onClick={() => setIsAddEmpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={newEmp.name}
                    onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                    placeholder="e.g. Priya Sundaram"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    placeholder="e.g. Lead Systems Engineer"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    placeholder="name@apexglobal.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newEmp.phone}
                    onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                    placeholder="+91 98200 11223"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Department</label>
                  <select
                    value={newEmp.departmentId}
                    onChange={(e) => setNewEmp({ ...newEmp, departmentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    required
                    value={newEmp.salary}
                    onChange={(e) => setNewEmp({ ...newEmp, salary: e.target.value })}
                    placeholder="e.g. 185000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddEmpModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs"
                >
                  Onboard Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
