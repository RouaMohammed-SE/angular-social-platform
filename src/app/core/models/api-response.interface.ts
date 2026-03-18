export interface ApiResponse<TData, TMeta = undefined> {
  success: boolean;
  message: string;
  data: TData;
  meta?: TMeta;
}
