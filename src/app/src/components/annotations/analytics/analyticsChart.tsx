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
  frameGroup: FrameGroup;
  confidence: number;
  seek: (frame: number) => void;
}

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

const getFrameTags = (frames: Frame[], confidence: number): FrameTag[] => {
  // return only tags from list of frames that are above confidence level
  const filteredTags = frames
    .filter((item: { confidence: number }) => item.confidence >= confidence)
    .map((item: { tag: FrameTag }) => item.tag);
  return filteredTags;
};

const getChartData = (
  frameGroup: FrameGroup,
  confidence: number
): RechartFrameData[] => {
  // returns [{}] (for recharts), each {} contains count of tag appearing for a single frame.
  const output: RechartFrameData[] = [];
  for (const frames in frameGroup) {
    const frameData: RechartFrameData = {
      frameGroup: Number(frames),
    };

    const frameTags = getFrameTags(frameGroup[frames], confidence);

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
  frameGroup: FrameGroup,
  confidence: number
): string[] => {
  // represents each line in the chart
  let output: string[] = [];

  for (const frames in frameGroup) {
    const allFrameTags = getFrameTags(frameGroup[frames], confidence);
    output.push(...new Set(allFrameTags.map(tag => tag.name)));
  }
  output = [...new Set(output)];
  return output;
};

const AnalyticsChart = ({
  frameGroup,
  confidence,
  seek,
}: AnalyticsChartProps) => {
  const rechartFrameData = getChartData(frameGroup, confidence);
  const uniqueTagNames = getUniqueTagNames(frameGroup, confidence);
  return (
    <ResponsiveContainer width="100%" height={130}>
      <LineChart
        data={rechartFrameData}
        onClick={e => {
          e?.activeLabel === undefined
            ? console.log(e?.activeLabel)
            : seek(Number(e?.activeLabel));
        }}
      >
        <CartesianGrid strokeDasharray="1 1" />
        <XAxis dataKey="frameGroup" />
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
