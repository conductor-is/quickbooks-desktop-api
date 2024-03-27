export interface ApiListResponse<T> {
  readonly url: string;
  readonly objectType: "list";
  readonly data: T[];
}
