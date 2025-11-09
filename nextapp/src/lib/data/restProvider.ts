import type { Point, FeatureCollection } from "geojson";
import type { MapIssue } from "../types";

type IssueCollection = FeatureCollection<Point, MapIssue>;

export interface IDataProvider {
  getFeatures(bbox: [number, number, number, number]): Promise<IssueCollection>;
}

export function createRestProvider(baseUrl: string): IDataProvider {
  return {
    async getFeatures(bbox: [number, number, number, number]): Promise<IssueCollection> {
      const url = `${baseUrl}?bbox=${bbox.join(",")}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    }
  };
}