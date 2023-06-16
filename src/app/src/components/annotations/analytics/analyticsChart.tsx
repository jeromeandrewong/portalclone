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
  frames: Frames;
  confidence: number;
  seek: (frame: number) => void;
}

type Frames = {
  [key: number]: Item[];
};

type ItemTag = {
  id: number;
  name: string;
};

type Item = {
  bound: number[][];
  boundType: string;
  confidence: number;
  tag: ItemTag;
  annotationID: string;
};

type RechartFrameData = {
  [key: string]: number;
};

const getFilteredItemTags = (Items: Item[], confidence: number): ItemTag[] => {
  // return only tags from list of frames that are above confidence level
  const filteredTags = Items.filter(
    (item: { confidence: number }) => item.confidence >= confidence
  ).map((item: { tag: ItemTag }) => item.tag);
  return filteredTags;
};

const getChartData = (
  frameGroup: Frames,
  confidence: number
): RechartFrameData[] => {
  // returns [{}] (for recharts), each {} contains count of tag appearing for a single frame.

  const output: RechartFrameData[] = [];
  for (const frames in frameGroup) {
    const frameData: RechartFrameData = {
      frameGroup: Number(frames),
    };

    const frameTags = getFilteredItemTags(frameGroup[frames], confidence);

    frameTags.forEach(key => {
      frameData[key.name] = frameData[key.name] ? frameData[key.name] + 1 : 1;
    });

    output.push(frameData);
  }

  return output;
};
const getUniqueTagNames = (frames: Frames, confidence: number): string[] => {
  // HOF > loops
  const itemArr = Object.values(frames);

  const allItemTags = itemArr.map(item =>
    getFilteredItemTags(item, confidence)
  );
  const allItemTagName = allItemTags.reduce(
    (acc, tags) => [...acc, ...tags.map(tag => tag.name)],
    [] as string[]
  );
  const uniqueItemTagNames = [...new Set(allItemTagName)];
  return uniqueItemTagNames;
};

const AnalyticsChart = ({ frames, confidence, seek }: AnalyticsChartProps) => {
  const rechartFrameData = getChartData(frames, confidence);
  const uniqueTagNames = getUniqueTagNames(frames, confidence);
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
