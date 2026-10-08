import {
  Bell,
  Folder,
  Layers,
  LayoutDashboard,
  ListTodo,
  Settings,
  Users,
} from "lucide-react";
import { useUserOrganization } from "../../../features/home/api/home.api";
import "./style.scss";
import { Label } from "../../ui/Form/Form";
import { Button } from "../../ui/Button/Button";
import { SIDEBAR } from "../../../constants/sidebar.constants";
import { useNavigate } from "@tanstack/react-router";

const Sidebar = () => {
  const { data } = useUserOrganization();
  const navigate = useNavigate();

  console.log(data);
  return (
    <div className="sidebar">
      <div className=" logo flex aic jcc g8">
        <Layers size={30} color="#6366F1" />
        <Label className="title-lg">orbit .</Label>
      </div>
      <div className="sidebar-org-accordion"></div>
      <div className="sidebar-menu g2">
        <Label className="sidebar-label label-md">WORKSPACE</Label>
        <div className="sidebar-menu-btn">
          {SIDEBAR.map((item) => {
            const Icon = item.logo;
            return (
              <Button
                className="sidebar-btn"
                variant="ghost"
                onClick={() => navigate({ to: item.routeTo as any })}
              >
                <Icon size={"40"} />
                <Label className="label-md">{item.label}</Label>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
