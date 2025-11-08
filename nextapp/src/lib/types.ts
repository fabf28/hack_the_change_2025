export type MapIssue = {
  id: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'open' | 'in-progress' | 'resolved';
  createdAt: string;
};

export type MapViewProps = {
  center?: [number, number];
  zoom?: number;
  issues?: MapIssue[];
  onIssueClick?: (issue: MapIssue) => void;
};