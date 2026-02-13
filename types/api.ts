type ApiResponse<T = null> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
};
