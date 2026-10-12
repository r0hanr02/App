import {
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import { useGetUserOrganization } from "../../../features/home/api/home.api";
import "./style.scss";
import { Label } from "../../ui/Form/Form";
import { Button } from "../../ui/Button/Button";
import { SIDEBAR } from "../../../constants/sidebar.constants";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useActiveOrg } from "../../../hooks/useActiveOrg";
import { withOrgSearch } from "../../../lib/orgParams";
import { ROUTES } from "../../../constants/routes.constants";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";

function formatRole(role: string): string {
  const lower = role.toLowerCase();
  return `${lower.charAt(0).toUpperCase()}${lower.slice(1)} workspace`;
}

const Sidebar = () => {
  const { isLoading } = useGetUserOrganization();
  const { organizations, activeOrg, activeOrgId, switchOrg } = useActiveOrg();
  const navigate = useNavigate();
  const [isPopOverOpen, setIsPopOverOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeOrgName = activeOrg?.organization_id?.organization_name;
  const handleSwitchOrg = (nextOrgId: string) => {
    setIsPopOverOpen(false);
    if (nextOrgId !== activeOrgId) switchOrg(nextOrgId);
  };

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
              {organizations.map((org: any) => {
                const orgId = org.organization_id?._id;
                const isActive = orgId === activeOrgId;
                return (
                  <Button
                    key={org._id}
                    variant="ghost"
                    className="org-popover-item"
                    onPress={() => orgId && handleSwitchOrg(orgId)}
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
                      <span className="org-plan">
                        {/* {formatRole(org.role)} */}
                      </span>
                    </span>
                    {isActive && <Check size={16} className="org-check" />}
                  </Button>
                );
              })}
              {organizations.length === 0 && !isLoading && (
                <span className="para-xs org-popover-hint">
                  No workspaces yet
                </span>
              )}
              <div className="divider" />
              <Button
                variant="ghost"
                className="org-popover-item"
                onPress={() => {
                  setIsPopOverOpen(false);
                  navigate({
                    to: ROUTES.ONBOARDING.path,
                    search: withOrgSearch(activeOrgId),
                  }).catch((err) => {
                    console.warn("Navigation to onboarding failed:", err);
                  });
                }}
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
              <Link
                className="sidebar-btn"
                activeProps={{
                  className: "sidebar-btn sidebar-btn-active",
                }}
                inactiveProps={{
                  className: "sidebar-btn",
                }}
                activeOptions={{
                  // "/" is a prefix of every path, so Dashboard needs exact matching.
                  exact: item.routeTo === ROUTES.HOME.path,
                }}
                aria-label={item.label}
                to={item.routeTo}
                search={(prev: Record<string, unknown>) =>
                  withOrgSearch(activeOrgId, prev)
                }
                key={`${item.label}-${id}`}
              >
                <Icon />
                <Label className="label-md">{item.label}</Label>
              </Link>
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
