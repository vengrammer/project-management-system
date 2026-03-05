# 📌 Project Management System Documentation

## 🛠️ Technology Stack

* ⚛️ **Frontend:** React.js
* 🎨 **UI & Styling:** Tailwind CSS, ShadCN UI, Lucide Icons
* 🖥️ **Backend:** Express.js
* 🗄️ **Database:** MongoDB
* 🔗 **API Layer:** GraphQL
* 🧠 **State Management:** Redux

---

# 📖 System Overview

The **Project Management System** is a web-based application designed to organize, manage, and track all project-related records in one centralized platform.

It enables administrators and managers to create projects, define tasks, and assign responsibilities to employees. Employees can view their assigned tasks and provide progress updates.

The system improves:

* ✅ Workflow efficiency
* ✅ Transparency
* ✅ Accountability
* ✅ Team collaboration
* ✅ Project tracking and reporting

Each project displays essential details such as:

* 📌 Project Title
* 💰 Project Budget/Cost
* 👥 Assigned Employees
* 📊 Project Status (Completed, in progress, Stuck)
* 📅 Deadlines and Timelines
* 📝 Task Breakdown

This structured approach ensures that everyone clearly understands their responsibilities and the current state of each project.

---

# 👥 User Roles & Permissions

The system has three primary roles:

* 👤 Employee (`user`)
* 👨‍💼 Manager
* 🛡️ Admin

---

## 👤 Employee (User)

### ✅ Permissions

* View tasks assigned to them
* Post updates on assigned tasks (progress reports, notes, completion updates)
* View project details related to their assigned tasks

### ❌ Restrictions

* Cannot create a new account
* Cannot create projects
* Cannot create tasks
* Cannot edit or update tasks not assigned to them
* Cannot delete tasks or projects

---

## 👨‍💼 Manager

### ✅ Permissions

* Manage only the projects assigned to them
* Create and update tasks within their assigned projects
* Assign tasks to employees
* Monitor employee progress
* Update project status (Ongoing, Completed, Stuck)

### ❌ Restrictions

* Cannot view all system projects (only those assigned to them)
* Cannot assign Admin or Manager roles to tasks
* Cannot modify system-wide settings

---

## 🛡️ Admin

### ✅ Permissions

* Full system access
* Create and manage all projects
* Assign managers to projects
* Create tasks
* Assign tasks to employees
* Manage users (create, update, deactivate accounts)
* View all projects across the system
* Generate reports and analytics

### ❌ Restrictions

* Cannot assign Manager or Admin roles to tasks (tasks are for employees only)

---

# 🏗️ Core System Features

## 📁 Project Management

* Create new projects
* Define project budget and deadline
* Assign a project manager
* Add employees to the project
* Set project status:

  * 🟢 Completed
  * 🟡 Ongoing
  * 🔴 Stuck

---

## 📋 Task Management

* Break down projects into manageable tasks
* Assign tasks to specific employees
* Set due dates and priorities
* Track task progress
* View task history and updates

---

## 📝 Task Updates

Employees can:

* Post daily or weekly progress updates
* Mark tasks as completed if they are assigned


Managers and Admins can:

* Review updates
* Identify delays or issues

---

## 📊 Monitoring & Reporting

The system provides visibility into:

* Project completion percentage
* Task distribution among employees
* Delayed or stuck tasks or logs
* Budget tracking (if implemented)
* Performance overview

---

# 🧩 System Architecture Overview

## ⚛️ Frontend (React.js)

* Component-based architecture
* ShadCN UI for clean and accessible UI components
* Tailwind CSS for responsive styling
* Lucide Icons for modern iconography
* Redux for global state management
* GraphQL client for API communication

---

## 🖥️ Backend (Express.js + GraphQL)

* REST/GraphQL API endpoints
* Authentication & role-based authorization
* Business logic validation
* Project and task management services

---

## 🗄️ Database (MongoDB)

Collections may include:

* Users
* Projects
* Tasks
* Task logs
* Department

Relationships:

* One Project -> Many Users → Many Tasks
* One Manager → Many Projects
* One Employee → Many Tasks -> Many Projects
* One Task → Many TaskLogs -> Many Users
* One Department -> Many Users

---

# 📌 Future Enhancements (Optional Improvements)

* 📅 Calendar view for deadlines
* 📎 File attachment support
* 🔔 Real-time notifications
* 📊 Dashboard analytics charts
* 💬 Task comments section
* 📱 Mobile responsive optimization
* 🧾 Export reports (PDF/Excel)