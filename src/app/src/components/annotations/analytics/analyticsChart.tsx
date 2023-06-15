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
  data: ChartData;
  confidence: number;
  seek: (frame: number) => void;
}

type ChartData = {
  fps: number;
  frames: FrameGroup;
  annotationID: string;
};

type FrameGroup = {
  [key: number]: Frame[];
};

type FrameTag = {
  id: number;
  name: string;
};

type Frame = {
  bound: number[][];
  boundType: string;
  confidence: number;
  tag: FrameTag;
  annotationID: string;
};

type RechartFrameData = {
  [key: string]: number;
};

const getFrameTags = (data: Frame[], confidence: number): FrameTag[] => {
  // return only  tags that are above confidence level
  const filteredTags = data
    .filter((item: { confidence: number }) => item.confidence >= confidence)
    .map((item: { tag: FrameTag }) => item.tag);
  return filteredTags;
};

const getChartData = (
  frames: FrameGroup,
  confidence: number
): RechartFrameData[] => {
  // returns [{}] (for recharts), each {} contains count of tag appearing for a single frame.
  const output: RechartFrameData[] = [];
  for (const frame in frames) {
    const frameData: RechartFrameData = {
      name: Number(frame),
    };

    const frameTags = getFrameTags(frames[frame], confidence);

    frameTags.forEach(key => {
      if (key.name in frameData) {
        frameData[key.name]++;
      } else {
        frameData[key.name] = 1;
      }
    });

    output.push(frameData);
  }

  return output;
};
const getUniqueTagNames = (
  frames: FrameGroup,
  confidence: number
): string[] => {
  // represents each line in the chart
  let output: string[] = [];

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
