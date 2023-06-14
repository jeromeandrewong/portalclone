import { Card } from "@blueprintjs/core";
import React from "react";

import { TooltipProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";

const customToolTip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <Card style={{ padding: 0, opacity: "90%", margin: 0 }}>
        <ul style={{ padding: "5px 5px", listStyleType: "none" }}>
          {payload.map(item => (
            <li key={item.dataKey} style={{ color: item.color }}>
              {item.name}: {item.value}
            </li>
          ))}
        </ul>
      </Card>
    );
  }

  return null;
};
export default customToolTip;
