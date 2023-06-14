import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TagColours } from "../../../constants/annotation";
import customToolTip from "./customToolTip";

interface AnalyticsChartProps {
  data: ChartDataType;
  confidence: number;
  seek: (frame: number) => void;
}

type ChartDataType = {
  fps: number;
  frames: {
    bound: number[][];
    boundType: string;
    confidence: number;
    tag: {
      id: number;
      name: string;
    };
    annotationID: string;
  };
};
type FrameTag = {
  id: number;
  name: string;
};

const getFrameTags = (data: any, confidence: number): FrameTag[] => {
  // return only  tags that are above confidence level
  const filteredTags = data
    .filter((item: { confidence: number }) => item.confidence >= confidence)
    .map((item: { tag: FrameTag }) => item.tag);
  return filteredTags;
};

const getChartData = (
  frames: any,
  confidence: number
): { [key: string]: number }[] => {
  // returns [{}] (for recharts), each {} contains count of tag appearing for a single frame.
  const output: any[] = [];
  for (const frame in frames) {
    const frameData: any = {
      name: frame,
    };
    console.log(frames[frame]);
    const frameTags = getFrameTags(frames[frame], confidence);
    const uniqueFrameTagName = [...new Set(frameTags.map(tag => tag.name))];

    uniqueFrameTagName.forEach(key => {
      frameData[key] = 0;
    });

    frameTags.forEach(key => {
      frameData[key.name]++;
    });

    output.push(frameData);
  }

  return output;
};
const getUniqueTagNames = (frames: any, confidence: number): string[] => {
  // represents each line in the chart
  let output = [];
  for (const frame in frames) {
    const allFrameTags = getFrameTags(frames[frame], confidence);
    output.push(...new Set(allFrameTags.map(tag => tag.name)));
  }
  output = [...new Set(output)];
  return output;
};

const AnalyticsChart = ({ data, confidence, seek }: AnalyticsChartProps) => {
  const chartData = getChartData(data.frames, confidence);
  const uniqueTagNames = getUniqueTagNames(data.frames, confidence);
  return (
    <ResponsiveContainer width="100%" height={130}>
      <LineChart
        data={chartData}
        onClick={e => {
          e?.activeLabel === undefined
            ? console.log(e?.activeLabel)
            : seek(Number(e?.activeLabel));
        }}
      >
        <CartesianGrid strokeDasharray="1 1" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip content={customToolTip} />
        {uniqueTagNames.map((tag: string, idx) => {
          const tagColor = TagColours[idx];
          return (
            <Line
              key={tag}
              dataKey={tag}
              type="monotone"
              stroke={tagColor}
              dot={false}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AnalyticsChart;
