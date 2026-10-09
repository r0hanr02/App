import {
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import { useUserOrganization } from "../../../features/home/api/home.api";
import "./style.scss";
import { Label } from "../../ui/Form/Form";
import { Button } from "../../ui/Button/Button";
import { SIDEBAR } from "../../../constants/sidebar.constants";
import { useNavigate } from "@tanstack/react-router";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { useState } from "react";

/** "OWNER" -> "Owner workspace". The API exposes a role, not a plan tier. */
function formatRole(role: string): string {
  const lower = role.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)} workspace`;
}

const Sidebar = () => {
  const { data, isLoading } = useUserOrganization();
  const navigate = useNavigate();
  const [isPopOverOpen, setIsPopOverOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const organizations = data?.data ?? [];
  const activeOrg = organizations[0];
  const activeOrgName = activeOrg?.organization_id?.organization_name;

  return (
    <div className={`sidebar${isCollapsed ? " sidebar-collapsed" : ""}`}>
      <div className="logo flex aic g8">
        <Layers size={30} color="#6366F1" />
        <Label className="title-xl">orbit .</Label>
      </div>
      <div className="sidebar-org-accordion">
        <DialogTrigger isOpen={isPopOverOpen} onOpenChange={setIsPopOverOpen}>
          <Button
            variant="ghost"
            className="org-accordion-trigger"
            aria-label="Switch workspace"
          >
            <span className="org-logo title-sm" aria-hidden="true">
              {activeOrgName ? (
                activeOrgName.charAt(0).toUpperCase()
              ) : (
                <Plus size={18} />
              )}
            </span>
            <span className="org-meta">
              <span className="org-name label-md">
                {activeOrgName ?? "Select workspace"}
              </span>
              <span className="org-plan">
                {activeOrg ? formatRole(activeOrg.role) : "No workspaces yet"}
              </span>
            </span>
            <span className="org-chevron" aria-hidden="true">
              {isPopOverOpen ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </span>
          </Button>
          <Popover
            placement="bottom start"
            offset={4}
            shouldFlip
            className="org-popover-menu"
          >
            <Dialog
              aria-label="Switch workspace"
              className="org-popover-dialog"
            >
              <div className="org-popover-header">
                <Label className="label-sm org-popover-title">Workspaces</Label>
              </div>
              {organizations.map((org, index) => (
                <Button
                  key={org._id}
                  variant="ghost"
                  className="org-popover-item"
                  onPress={() => setIsPopOverOpen(false)}
                >
                  <span className="org-logo org-logo-sm" aria-hidden="true">
                    {org.organization_id?.organization_name
                      ?.charAt(0)
                      .toUpperCase()}
                  </span>
                  <span className="org-meta">
                    <span className="org-name label-sm">
                      {org.organization_id.organization_name}
                    </span>
                    <span className="org-plan">{formatRole(org.role)}</span>
                  </span>
                  {index === 0 && (
                    <Check size={16} className="org-check" />
                  )}
                </Button>
              ))}
              {organizations.length === 0 && !isLoading && (
                <span className="para-xs org-popover-hint">
                  No workspaces yet
                </span>
              )}
              <div className="divider" />
              <Button
                variant="ghost"
                className="org-popover-item"
                onPress={() => setIsPopOverOpen(false)}
              >
                <Plus size={16} />
                <Label className="label-md">Create workspace</Label>
              </Button>
              {activeOrg && (
                <span className="para-xs org-popover-hint">
                  {organizations.length} workspace
                  {organizations.length === 1 ? "" : "s"}
                </span>
              )}
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>
      <div className="sidebar-menu g2">
        <Label className="sidebar-label label-md">WORKSPACE</Label>
        <div className="sidebar-menu-btn">
          {SIDEBAR.map((item, id) => {
            const Icon = item.logo;
            return (
              <Button
                className="sidebar-btn"
                variant="ghost"
                aria-label={item.label}
                onClick={() => navigate({ to: item.routeTo as any })}
                key={`${item.label}-${id}`}
              >
                <Icon />
                <Label className="label-md">{item.label}</Label>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="sidebar-projects-menu">
        <Label className="sidebar-label label-md">YOUR PROJECTS</Label>
      </div>

      <div className="sidebar-footer">
        <Button
          variant="ghost"
          className="sidebar-collapse-btn"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          onClick={() => setIsCollapsed((prev) => !prev)}
        >
          {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          <Label className="label-md">Collapse</Label>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
