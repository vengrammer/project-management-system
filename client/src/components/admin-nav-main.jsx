import { ChevronRight, LayoutDashboard } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

import { NavLink } from "react-router-dom";
import FormAddUser from "@/pages/admin/FormAddUser";

export function NavMain({
  items
}) {
// const location = useLocation();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Action</SidebarGroupLabel>
      {/*create a add user button*/}
      <div className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuSubButton asChild>
              <FormAddUser />
            </SidebarMenuSubButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>

      {/*trying to add dashboard link*/}
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuSubButton asChild>
            <NavLink to="/admin/dashboard" className="flex items-center gap-2">
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </NavLink>
          </SidebarMenuSubButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        {/*this is the link of the sidebar*/}
                        <NavLink
                          to={subItem.url}
                          className={({ isActive }) =>
                            isActive
                              ? "bg-muted text-primary font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          <span>{subItem.title}</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}