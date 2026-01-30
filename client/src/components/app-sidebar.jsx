"use client"

import * as React from "react"
import {
  BookOpen,
  Settings2,
  FolderOpenDot,
  FolderGit2,
  Trash2,
  CheckLine,
  Users,
  ClipboardList
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "https://ui-avatars.com/api/?name=John+Doe",
  },
  teams: [
    {
      name: "Bernales & Associates",
      logo: FolderGit2,
      plan: "Project Management",
    },
  ],
  navMain: [
    {
      title: "Projects",
      url: "#",
      icon: FolderOpenDot,
      isActive: true,
      items: [
        {
          title: "My projects",
          url: "/admin/myprojects",
        },
        {
          title: "latest activities",
          url: "#",
        },
      ],
    },
    {
      title: "Employees",
      url: "#",
      icon: Users,
      items: [
        {
          title: "team members",
          url: "/admin/teammembers",
        },
        {
          title: "latest updates",
          url: "#",
        },
        {
          title: "ongoing tasks",
          url: "#",
        },
        {
          title: "stuck tasks",
          url: "#",
        },
        {
          title: "done tasks",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Archive",
      url: "#",
      icon: Trash2,
    },
    {
      name: "Done projects",
      url: "#",
      icon: CheckLine,
    },
  ],
};
export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
