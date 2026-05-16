export type CollectionKey = "accessories" | "bridal" | "quinceanera" | "prom-formal" | "evening" | "shoes-bags";

export type CollectionSection = {
  key: CollectionKey;
  label: string;
  itemCount: number;
  description: string;
  position: [number, number, number];
  size: [number, number, number];
  route: string;
};
