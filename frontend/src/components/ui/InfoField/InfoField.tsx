import React from "react";
import "./style.scss";

export interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}


export const InfoField: React.FC<InfoFieldProps> = ({ label, value, className = "" }) => {
  return (
    <div className={["ui-info-field", className].filter(Boolean).join(" ")}>
      <div className="ui-info-field__label">{label}</div>
      <div className="ui-info-field__value">{value}</div>
    </div>
  );
};

export default InfoField;