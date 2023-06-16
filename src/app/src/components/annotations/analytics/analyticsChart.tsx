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
  frames: Frames,
  confidence: number
): RechartFrameData[] => {
  // returns [{}] (for recharts), each {} contains count of item appearing for a single frame.

  const itemArr = Object.values(frames);
  const allItemTags = itemArr.map(item =>
    getFilteredItemTags(item, confidence)
  );

  //map to record count of each item for each frame (k: id, v:count)
  const itemCountMap: Map<string, number>[] = allItemTags.map(tagArr =>
    tagArr.reduce(
      (acc, tag) => acc.set(tag.name, (acc.get(tag.name) || 0) + 1),
      new Map()
    )
  );

  const frameNames: string[] = Object.keys(frames);

  const itemCountArr = itemCountMap.map(item => [...item.entries()]);
  console.log(itemCountArr[0]);

  const allTagCountDistribition: RechartFrameData[] = itemCountArr.map(
    (tagCount, i) => {
      return tagCount.reduce(
        (acc, [name, count]) => {
          acc[name] = count;
          return acc;
        },
        {
          frame: Number(frameNames[i]),
        } as RechartFrameData
      );
    }
  );
  return allTagCountDistribition;
};
const getUniqueTagNames = (frames: Frames, confidence: number): string[] => {
  // HOF > loops
  const itemArr = Object.values(frames);

  const allItemTags = itemArr.map(item =>
    getFilteredItemTags(item, confidence)
  );
  const allItemTagName = allItemTags.reduce(
    (acc, tagArr) => [...acc, ...tagArr.map(tag => tag.name)],
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
        <XAxis dataKey="frame" />
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
